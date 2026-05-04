import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleChangeRequest, RequestType, RequestStatus } from '../entities/role-change-request.entity';
import { RoleApprovalWorkflow, ApprovalStage } from '../entities/role-approval-workflow.entity';
import { CustomRole } from '../entities/custom-role.entity';
import { RiskScoringEngine } from './risk-scoring.engine';

export interface ApprovalAction {
  stageNumber: number;
  approverId: string;
  action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';
  comments?: string;
  timestamp: Date;
  ipAddress?: string;
}

export interface WorkflowProgress {
  currentStage: number;
  totalStages: number;
  status: string;
  completedStages: ApprovalStage[];
  pendingStages: ApprovalStage[];
  approvalHistory: any[];
  estimatedCompletionDate?: Date;
}

/**
 * Governance & Approval Workflow Engine
 * 
 * Manages:
 * - Multi-stage approval workflows
 * - Legal review for high-risk roles
 * - Change impact simulation
 * - Version comparison
 * - Compliance validation
 */
@Injectable()
export class GovernanceWorkflowService {
  private readonly logger = new Logger(GovernanceWorkflowService.name);

  constructor(
    @InjectRepository(RoleChangeRequest)
    private readonly changeRequestRepository: Repository<RoleChangeRequest>,
    @InjectRepository(RoleApprovalWorkflow)
    private readonly workflowRepository: Repository<RoleApprovalWorkflow>,
    @InjectRepository(CustomRole)
    private readonly roleRepository: Repository<CustomRole>,
    private readonly riskEngine: RiskScoringEngine,
  ) {}

  /**
   * Initiates a change request with appropriate workflow
   */
  async initiateChangeRequest(
    tenantId: string,
    roleId: string | null,
    requestType: RequestType,
    requestedChanges: any,
    requestedBy: string,
    justification?: string
  ): Promise<RoleChangeRequest> {
    this.logger.log(`Initiating ${requestType} change request for role ${roleId}`);

    // 1. Perform impact analysis
    const impactAnalysis = await this.performImpactAnalysis(roleId, requestType, requestedChanges, tenantId);

    // 2. Calculate risk score
    const riskScore = impactAnalysis.riskScore || 0;

    // 3. Determine appropriate workflow
    const workflow = await this.selectWorkflow(tenantId, riskScore, impactAnalysis.sensitivityLevel);

    // 4. Check if requires legal review
    const requiresLegalReview = this.requiresLegalReview(riskScore, impactAnalysis);

    // 5. Create change request
    const changeRequest = this.changeRequestRepository.create({
      tenantId,
      roleId,
      requestType,
      requestedChanges,
      changeSnapshot: { after: requestedChanges },
      impactAssessment: impactAnalysis as any,
      riskScore,
      status: RequestStatus.PENDING,
      workflowId: workflow?.id,
      currentStage: 0,
      approvalHistory: [],
      justification,
      requestedBy,
      requestedAt: new Date()
    });

    const saved = await this.changeRequestRepository.save(changeRequest);

    // 6. Auto-approve if below risk threshold
    if (workflow?.autoApproveBelowRisk && riskScore < workflow.autoApproveBelowRisk) {
      await this.autoApprove(saved.id, 'Risk score below auto-approval threshold');
    } else if (requiresLegalReview) {
      this.logger.log(`Legal review required for change request ${saved.id}`);
      // Trigger legal review notification (implement as needed)
    }

    this.logger.log(`Change request ${saved.id} created with status ${saved.status}`);
    return saved;
  }

  /**
   * Processes an approval action
   */
  async processApproval(
    changeRequestId: string,
    approverId: string,
    action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES',
    comments?: string,
    ipAddress?: string
  ): Promise<RoleChangeRequest> {
    const changeRequest = await this.changeRequestRepository.findOne({
      where: { id: changeRequestId }
    });

    if (!changeRequest) {
      throw new Error(`Change request ${changeRequestId} not found`);
    }

    if (changeRequest.status !== RequestStatus.PENDING && 
        changeRequest.status !== RequestStatus.IN_REVIEW && 
        changeRequest.status !== RequestStatus.UNDER_REVIEW) {
      throw new Error(`Change request ${changeRequestId} is not in a pending state`);
    }

    // Load workflow
    const workflow = changeRequest.workflowId ? 
      await this.workflowRepository.findOne({ where: { id: changeRequest.workflowId } }) : 
      null;
    
    if (!workflow) {
      throw new Error(`No workflow defined for change request ${changeRequestId}`);
    }

    const stages: ApprovalStage[] = workflow.stages || [];
    const currentStage = changeRequest.currentStage;

    // Validate approver
    const stage = stages[currentStage];
    if (!stage) {
      throw new Error(`Invalid stage ${currentStage}`);
    }

    if (!stage.approvers || !stage.approvers.includes(approverId)) {
      throw new Error(`User ${approverId} is not authorized to approve at this stage`);
    }

    // Record approval action
    const approvalRecord: any = {
      stageNumber: currentStage,
      stageName: stage.stageName || `Stage ${currentStage}`,
      approverId,
      approverName: approverId, // Would need to lookup actual name
      action: action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'APPROVED',
      comments: comments || '',
      timestamp: new Date()
    };

    const approvalHistory = [...(changeRequest.approvalHistory || []), approvalRecord];
    changeRequest.approvalHistory = approvalHistory;

    // Process action
    if (action === 'REJECT') {
      changeRequest.status = RequestStatus.REJECTED;
      changeRequest.reviewedBy = approverId;
      changeRequest.reviewedAt = new Date();
    } else if (action === 'REQUEST_CHANGES') {
      changeRequest.status = RequestStatus.PENDING;
      // Notify requester
    } else if (action === 'APPROVE') {
      // Check if all approvers in current stage have approved (if requiresAll)
      const stageApprovals = approvalHistory.filter(
        a => a.stageNumber === currentStage && a.action === 'APPROVE'
      );

      const requiredApprovals = stage.requiresAll ? stage.approvers.length : 1;

      if (stageApprovals.length >= requiredApprovals) {
        // Move to next stage
        if (currentStage < stages.length - 1) {
          changeRequest.currentStage = currentStage + 1;
          changeRequest.status = RequestStatus.IN_REVIEW;
        } else {
          // All stages complete - approve
          changeRequest.status = RequestStatus.APPROVED;
          changeRequest.reviewedBy = approverId;
          changeRequest.reviewedAt = new Date();

          // Implement the change
          await this.implementChange(changeRequest);
        }
      }
    }

    return await this.changeRequestRepository.save(changeRequest);
  }

  /**
   * Gets workflow progress for a change request
   */
  async getWorkflowProgress(changeRequestId: string): Promise<WorkflowProgress> {
    const changeRequest = await this.changeRequestRepository.findOne({
      where: { id: changeRequestId }
    });

    if (!changeRequest) {
      throw new Error(`Change request ${changeRequestId} not found`);
    }

    // Load workflow
    const workflow = changeRequest.workflowId ? 
      await this.workflowRepository.findOne({ where: { id: changeRequest.workflowId } }) : 
      null;
    
    if (!workflow) {
      throw new Error(`No workflow defined for change request ${changeRequestId}`);
    }

    const stages: ApprovalStage[] = workflow.stages || [];
    const currentStage = changeRequest.currentStage;

    const completedStages = stages.slice(0, currentStage);
    const pendingStages = stages.slice(currentStage);

    // Estimate completion date based on stage timeouts
    let estimatedHours = 0;
    for (const stage of pendingStages) {
      estimatedHours += stage.slaHours || 48;
    }
    const estimatedCompletionDate = new Date();
    estimatedCompletionDate.setHours(estimatedCompletionDate.getHours() + estimatedHours);

    return {
      currentStage,
      totalStages: stages.length,
      status: changeRequest.status,
      completedStages,
      pendingStages,
      approvalHistory: changeRequest.approvalHistory || [],
      estimatedCompletionDate
    };
  }

  /**
   * Performs impact analysis for a change
   */
  private async performImpactAnalysis(
    roleId: string | null,
    requestType: string,
    requestedChanges: any,
    tenantId: string
  ): Promise<any> {
    const analysis: any = {
      requestType,
      timestamp: new Date(),
      impactedEntities: [],
      riskFactors: [],
      warnings: [],
      recommendations: []
    };

    if (roleId) {
      const role = await this.roleRepository.findOne({
        where: { id: roleId },
        relations: ['permissions', 'compositions']
      });

      if (role) {
        // Calculate risk score
        const riskAssessment = await this.riskEngine.calculateRiskScore(roleId, tenantId);
        analysis.riskScore = riskAssessment.totalScore;
        analysis.sensitivityLevel = role.sensitivityLevel;

        // Analyze permission changes
        if (requestType === 'PERMISSION_CHANGE') {
          const addedPermissions = requestedChanges.addedPermissions || [];
          const removedPermissions = requestedChanges.removedPermissions || [];

          analysis.impactedEntities.push({
            type: 'PERMISSIONS',
            added: addedPermissions.length,
            removed: removedPermissions.length
          });

          // High-risk permission warnings
          if (addedPermissions.some((p: any) => p.dataType === 'FINANCIAL' || p.dataType === 'PII')) {
            analysis.warnings.push('Adding high-sensitivity permissions');
            analysis.riskFactors.push('HIGH_SENSITIVITY_PERMISSIONS');
          }
        }

        // Analyze composition changes
        if (requestType === 'COMPOSITION_CHANGE') {
          analysis.impactedEntities.push({
            type: 'INHERITANCE',
            changes: requestedChanges.compositionChanges || []
          });

          if (requestedChanges.compositionChanges?.length > 3) {
            analysis.warnings.push('Multiple inheritance changes may increase complexity');
          }
        }

        // Check for SoD violations
        // (This would integrate with SoD engine)
        analysis.recommendations.push('Review for Segregation of Duties violations');
      }
    } else {
      // New role creation
      analysis.riskScore = requestedChanges.sensitivityLevel === 'CRITICAL' ? 75 : 50;
      analysis.sensitivityLevel = requestedChanges.sensitivityLevel;
      analysis.recommendations.push('Ensure role follows principle of least privilege');
    }

    return analysis;
  }

  /**
   * Selects appropriate workflow based on risk and sensitivity
   */
  private async selectWorkflow(
    tenantId: string,
    riskScore: number,
    sensitivityLevel?: string
  ): Promise<RoleApprovalWorkflow | null> {
    // Find matching workflow
    const workflows = await this.workflowRepository.find({
      where: { tenantId, isActive: true }
    });

    // Sort by risk level descending
    workflows.sort((a, b) => (b.appliesToRiskLevel || 0) - (a.appliesToRiskLevel || 0));

    for (const workflow of workflows) {
      if (workflow.appliesToRiskLevel && riskScore >= workflow.appliesToRiskLevel) {
        return workflow;
      }
      if (workflow.appliesToSensitivity && workflow.appliesToSensitivity === sensitivityLevel) {
        return workflow;
      }
    }

    return null; // No workflow required - simple approval
  }

  /**
   * Determines if legal review is required
   */
  private requiresLegalReview(riskScore: number, impactAnalysis: any): boolean {
    // Legal review required for:
    // 1. High risk scores (>= 80)
    // 2. Critical sensitivity level
    // 3. Compliance-related changes
    // 4. Financial data access changes

    if (riskScore >= 80) return true;
    if (impactAnalysis.sensitivityLevel === 'CRITICAL') return true;
    if (impactAnalysis.riskFactors?.includes('HIGH_SENSITIVITY_PERMISSIONS')) return true;
    if (impactAnalysis.riskFactors?.includes('FINANCIAL_ACCESS')) return true;

    return false;
  }

  /**
   * Auto-approves a change request
   */
  private async autoApprove(changeRequestId: string, reason: string): Promise<void> {
    const changeRequest = await this.changeRequestRepository.findOne({
      where: { id: changeRequestId }
    });

    if (!changeRequest) return;

    changeRequest.status = RequestStatus.APPROVED;
    changeRequest.approvalHistory = [
      {
        stageNumber: 0,
        stageName: 'Auto-Approval',
        approverId: 'SYSTEM',
        approverName: 'System',
        action: 'APPROVED',
        comments: `Auto-approved: ${reason}`,
        timestamp: new Date()
      }
    ];

    await this.changeRequestRepository.save(changeRequest);
    await this.implementChange(changeRequest);
  }

  /**
   * Implements an approved change
   */
  private async implementChange(changeRequest: RoleChangeRequest): Promise<void> {
    this.logger.log(`Implementing change request ${changeRequest.id}`);

    try {
      const { requestType, roleId, requestedChanges } = changeRequest;

      switch (requestType) {
        case RequestType.CREATE:
          await this.createRole(changeRequest.tenantId, requestedChanges, changeRequest.requestedBy);
          break;

        case RequestType.UPDATE:
        case RequestType.MODIFY:
          if (roleId) {
            await this.updateRole(roleId, requestedChanges, changeRequest.requestedBy);
          }
          break;

        case RequestType.DELETE:
          if (roleId) {
            await this.deleteRole(roleId);
          }
          break;

        case RequestType.PERMISSION_CHANGE:
          if (roleId) {
            await this.updatePermissions(roleId, requestedChanges);
          }
          break;

        case RequestType.COMPOSITION_CHANGE:
          if (roleId) {
            await this.updateComposition(roleId, requestedChanges);
          }
          break;
      }

      changeRequest.status = RequestStatus.IMPLEMENTED;
      await this.changeRequestRepository.save(changeRequest);

      this.logger.log(`Change request ${changeRequest.id} implemented successfully`);
    } catch (error) {
      this.logger.error(`Error implementing change request ${changeRequest.id}:`, error);
      changeRequest.status = RequestStatus.APPROVED; // Revert to approved if implementation fails
      await this.changeRequestRepository.save(changeRequest);
      throw error;
    }
  }


  // Placeholder methods for actual implementation
  private async createRole(tenantId: string, roleData: any, createdBy: string): Promise<void> {
    const role = this.roleRepository.create({
      ...roleData,
      tenantId,
      createdBy
    });
    await this.roleRepository.save(role);
  }

  private async updateRole(roleId: string, changes: any, modifiedBy: string): Promise<void> {
    await this.roleRepository.update(roleId, {
      ...changes,
      modifiedBy,
      modifiedAt: new Date()
    });
  }

  private async deleteRole(roleId: string): Promise<void> {
    await this.roleRepository.update(roleId, { isActive: false });
  }

  private async updatePermissions(roleId: string, changes: any): Promise<void> {
    // Implementation would add/remove role permissions
    this.logger.log(`Updating permissions for role ${roleId}`);
  }

  private async updateComposition(roleId: string, changes: any): Promise<void> {
    // Implementation would update role compositions
    this.logger.log(`Updating composition for role ${roleId}`);
  }

  /**
   * Simulates change before approval
   */
  async simulateChange(
    roleId: string | null,
    requestType: string,
    requestedChanges: any,
    tenantId: string
  ): Promise<any> {
    this.logger.log(`Simulating ${requestType} change for role ${roleId}`);

    const simulation = {
      timestamp: new Date(),
      changeType: requestType,
      predictedImpact: {},
      warnings: [],
      risksIdentified: [],
      affectedUsers: 0,
      affectedPermissions: 0,
      recommendation: 'APPROVE'
    };

    // Perform impact analysis
    const impact = await this.performImpactAnalysis(roleId, requestType, requestedChanges, tenantId);
    simulation.predictedImpact = impact;

    // Calculate affected entities
    if (roleId) {
      // Count users with this role (mock - would query actual user-role mappings)
      simulation.affectedUsers = 0;
    }

    // Risk-based recommendation
    if (impact.riskScore >= 80) {
      simulation.recommendation = 'REQUIRES_REVIEW';
      simulation.warnings.push('High risk score detected');
    }

    if (impact.warnings.length > 0) {
      simulation.warnings.push(...impact.warnings);
    }

    return simulation;
  }

  /**
   * Compare two role versions
   */
  async compareVersions(roleId: string, version1: number, version2: number): Promise<any> {
    this.logger.log(`Comparing versions ${version1} and ${version2} for role ${roleId}`);

    // Implementation would fetch role versions and compute diff
    return {
      roleId,
      version1,
      version2,
      differences: {
        metadata: [],
        permissions: [],
        compositions: []
      },
      timestamp: new Date()
    };
  }
}
