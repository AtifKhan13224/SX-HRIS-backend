import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GovernanceWorkflow, WorkflowStatus, ApprovalLevel } from '../entities/governance-workflow.entity';
import { CreateGovernanceWorkflowDto, ApproveWorkflowDto, RejectWorkflowDto, QueryWorkflowDto } from '../dto/governance-workflow.dto';
import { AuditService } from './audit.service';
import { AuditEventType, AuditSeverity } from '../entities/audit-log.entity';

@Injectable()
export class GovernanceWorkflowService {
  constructor(
    @InjectRepository(GovernanceWorkflow)
    private readonly workflowRepository: Repository<GovernanceWorkflow>,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Create a new governance workflow
   */
  async createWorkflow(createDto: CreateGovernanceWorkflowDto): Promise<GovernanceWorkflow> {
    // Generate unique request ID
    const requestId = createDto.requestId || this.generateRequestId();

    // Check if request ID already exists
    const existing = await this.workflowRepository.findOne({ where: { requestId } });
    if (existing) {
      throw new BadRequestException(`Workflow with request ID ${requestId} already exists`);
    }

    // Perform risk assessment
    const riskAssessment = await this.assessRisk(createDto);

    // Initialize approval chain
    const approvalChain = this.buildApprovalChain(
      createDto.currentApprovers,
      createDto.requiredApprovals
    );

    const workflow = this.workflowRepository.create({
      ...createDto,
      requestId,
      workflowStatus: WorkflowStatus.PENDING,
      submittedAt: new Date(),
      receivedApprovals: 0,
      riskAssessment: createDto.riskAssessment || riskAssessment,
      approvalChain,
      auditTrail: [{
        timestamp: new Date(),
        actor: createDto.requestorId,
        action: 'WORKFLOW_CREATED',
        details: 'Workflow created',
      }],
    });

    const savedWorkflow = await this.workflowRepository.save(workflow);

    // Audit log
    await this.auditService.log({
      tenantId: createDto.tenantId,
      userId: createDto.requestorId,
      eventType: AuditEventType.COMPLIANCE_EVENT,
      severity: createDto.isUrgent ? AuditSeverity.HIGH : AuditSeverity.MEDIUM,
      eventDescription: `Created governance workflow: ${createDto.workflowType}`,
      entityType: 'WORKFLOW',
      entityId: savedWorkflow.id,
      contextData: { requestId, workflowType: createDto.workflowType },
    });

    return savedWorkflow;
  }

  /**
   * Approve a workflow
   */
  async approveWorkflow(approveDto: ApproveWorkflowDto): Promise<GovernanceWorkflow> {
    const workflow = await this.findById(approveDto.workflowId);

    if (workflow.workflowStatus !== WorkflowStatus.PENDING) {
      throw new BadRequestException(`Workflow is not in pending status`);
    }

    // Check if approver is in current approvers list
    if (!workflow.currentApprovers?.includes(approveDto.approverId)) {
      throw new BadRequestException(`User is not authorized to approve this workflow`);
    }

    // Update approval chain
    const updatedChain = workflow.approvalChain || [];
    const approvalEntry = {
      level: approveDto.approvalLevel,
      approverId: approveDto.approverId,
      approverName: approveDto.approverName,
      approvalStatus: 'APPROVED',
      approvedAt: new Date(),
      comments: approveDto.comments || '',
    };
    updatedChain.push(approvalEntry);

    // Increment received approvals
    workflow.receivedApprovals += 1;
    workflow.approvalChain = updatedChain;

    // Update audit trail
    const auditTrail = workflow.auditTrail || [];
    auditTrail.push({
      timestamp: new Date(),
      actor: approveDto.approverId,
      action: 'WORKFLOW_APPROVED',
      details: `Approved by ${approveDto.approverName}${approveDto.comments ? `: ${approveDto.comments}` : ''}`,
    });
    workflow.auditTrail = auditTrail;

    // Check if all required approvals received
    if (workflow.receivedApprovals >= workflow.requiredApprovals) {
      workflow.workflowStatus = WorkflowStatus.APPROVED;
      workflow.approvedAt = new Date();
      workflow.approvedBy = approveDto.approverId;

      auditTrail.push({
        timestamp: new Date(),
        actor: 'SYSTEM',
        action: 'WORKFLOW_COMPLETED',
        details: 'All required approvals received',
      });
      workflow.auditTrail = auditTrail;
    }

    const savedWorkflow = await this.workflowRepository.save(workflow);

    // Audit log
    await this.auditService.log({
      tenantId: workflow.tenantId,
      userId: approveDto.approverId,
      eventType: workflow.workflowStatus === WorkflowStatus.APPROVED ? AuditEventType.SOD_EXCEPTION_GRANTED : AuditEventType.PRIVILEGE_ESCALATION,
      severity: AuditSeverity.HIGH,
      eventDescription: `Approved workflow: ${workflow.requestId}`,
      entityType: 'WORKFLOW',
      entityId: workflow.id,
    });

    return savedWorkflow;
  }

  /**
   * Reject a workflow
   */
  async rejectWorkflow(rejectDto: RejectWorkflowDto): Promise<GovernanceWorkflow> {
    const workflow = await this.findById(rejectDto.workflowId);

    if (workflow.workflowStatus !== WorkflowStatus.PENDING) {
      throw new BadRequestException(`Workflow is not in pending status`);
    }

    workflow.workflowStatus = WorkflowStatus.REJECTED;
    workflow.rejectedAt = new Date();
    workflow.rejectedBy = rejectDto.rejectedBy;
    workflow.rejectionReason = rejectDto.rejectionReason;

    // Update audit trail
    const auditTrail = workflow.auditTrail || [];
    auditTrail.push({
      timestamp: new Date(),
      actor: rejectDto.rejectedBy,
      action: 'WORKFLOW_REJECTED',
      details: `Rejected: ${rejectDto.rejectionReason}`,
    });
    workflow.auditTrail = auditTrail;

    const savedWorkflow = await this.workflowRepository.save(workflow);

    // Audit log
    await this.auditService.log({
      tenantId: workflow.tenantId,
      userId: rejectDto.rejectedBy,
      eventType: AuditEventType.COMPLIANCE_EVENT,
      severity: AuditSeverity.MEDIUM,
      eventDescription: `Rejected workflow: ${workflow.requestId}`,
      entityType: 'WORKFLOW',
      entityId: workflow.id,
      contextData: { reason: rejectDto.rejectionReason },
    });

    return savedWorkflow;
  }

  /**
   * Query workflows
   */
  async queryWorkflows(queryDto: QueryWorkflowDto): Promise<GovernanceWorkflow[]> {
    const where: any = {};

    if (queryDto.workflowType) where.workflowType = queryDto.workflowType;
    if (queryDto.workflowStatus) where.workflowStatus = queryDto.workflowStatus;
    if (queryDto.requestorId) where.requestorId = queryDto.requestorId;
    if (queryDto.tenantId) where.tenantId = queryDto.tenantId;
    if (queryDto.isUrgent !== undefined) where.isUrgent = queryDto.isUrgent;

    return this.workflowRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get pending workflows for approver
   */
  async getPendingWorkflowsForApprover(approverId: string): Promise<GovernanceWorkflow[]> {
    const allPending = await this.workflowRepository.find({
      where: { workflowStatus: WorkflowStatus.PENDING },
      order: { isUrgent: 'DESC', priority: 'DESC', createdAt: 'ASC' },
    });

    return allPending.filter(wf => wf.currentApprovers?.includes(approverId));
  }

  /**
   * Cancel a workflow
   */
  async cancelWorkflow(workflowId: string, cancelledBy: string, reason: string): Promise<GovernanceWorkflow> {
    const workflow = await this.findById(workflowId);

    if (workflow.workflowStatus !== WorkflowStatus.PENDING) {
      throw new BadRequestException(`Cannot cancel workflow in ${workflow.workflowStatus} status`);
    }

    workflow.workflowStatus = WorkflowStatus.CANCELLED;

    // Update audit trail
    const auditTrail = workflow.auditTrail || [];
    auditTrail.push({
      timestamp: new Date(),
      actor: cancelledBy,
      action: 'WORKFLOW_CANCELLED',
      details: `Cancelled: ${reason}`,
    });
    workflow.auditTrail = auditTrail;

    return this.workflowRepository.save(workflow);
  }

  /**
   * Check and expire workflows
   */
  async expireWorkflows(): Promise<number> {
    const now = new Date();

    const expirableWorkflows = await this.workflowRepository.find({
      where: { workflowStatus: WorkflowStatus.PENDING },
    });

    let expiredCount = 0;

    for (const workflow of expirableWorkflows) {
      if (workflow.expiresAt && workflow.expiresAt < now) {
        workflow.workflowStatus = WorkflowStatus.EXPIRED;
        workflow.isExpired = true;

        const auditTrail = workflow.auditTrail || [];
        auditTrail.push({
          timestamp: now,
          actor: 'SYSTEM',
          action: 'WORKFLOW_EXPIRED',
          details: 'Workflow expired due to timeout',
        });
        workflow.auditTrail = auditTrail;

        await this.workflowRepository.save(workflow);
        expiredCount++;
      }
    }

    return expiredCount;
  }

  /**
   * Get workflow statistics
   */
  async getWorkflowStatistics(tenantId?: string): Promise<any> {
    const where: any = {};
    if (tenantId) where.tenantId = tenantId;

    const allWorkflows = await this.workflowRepository.find({ where });

    const stats = {
      total: allWorkflows.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
      expired: 0,
      urgent: 0,
      avgApprovalTime: 0,
      byType: {} as Record<string, number>,
    };

    let totalApprovalTimeMs = 0;
    let approvedCount = 0;

    allWorkflows.forEach(wf => {
      // Count by status
      switch (wf.workflowStatus) {
        case WorkflowStatus.PENDING:
          stats.pending++;
          break;
        case WorkflowStatus.APPROVED:
          stats.approved++;
          if (wf.submittedAt && wf.approvedAt) {
            totalApprovalTimeMs += wf.approvedAt.getTime() - wf.submittedAt.getTime();
            approvedCount++;
          }
          break;
        case WorkflowStatus.REJECTED:
          stats.rejected++;
          break;
        case WorkflowStatus.CANCELLED:
          stats.cancelled++;
          break;
        case WorkflowStatus.EXPIRED:
          stats.expired++;
          break;
      }

      // Count urgent
      if (wf.isUrgent) stats.urgent++;

      // Count by type
      const type = wf.workflowType;
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    });

    // Calculate average approval time in hours
    if (approvedCount > 0) {
      stats.avgApprovalTime = Math.round(totalApprovalTimeMs / approvedCount / (1000 * 60 * 60));
    }

    return stats;
  }

  /**
   * Find workflow by ID
   */
  async findById(workflowId: string): Promise<GovernanceWorkflow> {
    const workflow = await this.workflowRepository.findOne({ where: { id: workflowId } });

    if (!workflow) {
      throw new NotFoundException(`Workflow with ID ${workflowId} not found`);
    }

    return workflow;
  }

  /**
   * Private helper methods
   */

  private generateRequestId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `WF-${timestamp}-${random}`.toUpperCase();
  }

  private buildApprovalChain(approvers: string[], requiredApprovals: number): any[] {
    return approvers.slice(0, requiredApprovals).map((approverId, index) => ({
      level: `L${index + 1}` as ApprovalLevel,
      approverId,
      approverName: '',
      approvalStatus: 'PENDING',
      approvedAt: null,
      comments: '',
    }));
  }

  private async assessRisk(createDto: CreateGovernanceWorkflowDto): Promise<any> {
    let riskScore = 0;
    const riskFactors: string[] = [];

    // Assess based on workflow type
    const highRiskTypes = ['PRIVILEGE_ESCALATION', 'BREAK_GLASS_ACCESS', 'SOD_EXCEPTION'];
    if (highRiskTypes.includes(createDto.workflowType)) {
      riskScore += 5;
      riskFactors.push('High-risk workflow type');
    }

    // Assess urgency
    if (createDto.isUrgent) {
      riskScore += 2;
      riskFactors.push('Urgent request');
    }

    // Determine risk level
    let riskLevel = 'LOW';
    if (riskScore >= 7) riskLevel = 'CRITICAL';
    else if (riskScore >= 5) riskLevel = 'HIGH';
    else if (riskScore >= 3) riskLevel = 'MEDIUM';

    return {
      riskLevel,
      riskScore,
      riskFactors,
    };
  }
}
