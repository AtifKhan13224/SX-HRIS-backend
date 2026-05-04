import { Controller, Get, Post, Put, Body, Param, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { GovernanceWorkflowService } from '../services/governance-workflow.service';
import {
  CreateGovernanceWorkflowDto,
  ApproveWorkflowDto,
  RejectWorkflowDto,
  QueryWorkflowDto,
} from '../dto/governance-workflow.dto';
import { GovernanceWorkflow } from '../entities/governance-workflow.entity';

@Controller('api/rbac/governance')
export class GovernanceWorkflowController {
  constructor(private readonly workflowService: GovernanceWorkflowService) {}

  @Post('workflows')
  @HttpCode(HttpStatus.CREATED)
  async createWorkflow(@Body() createDto: CreateGovernanceWorkflowDto): Promise<GovernanceWorkflow> {
    return this.workflowService.createWorkflow(createDto);
  }

  @Post('workflows/query')
  @HttpCode(HttpStatus.OK)
  async queryWorkflows(@Body() queryDto: QueryWorkflowDto): Promise<GovernanceWorkflow[]> {
    return this.workflowService.queryWorkflows(queryDto);
  }

  @Get('workflows/:id')
  async getWorkflowById(@Param('id') id: string): Promise<GovernanceWorkflow> {
    return this.workflowService.findById(id);
  }

  @Post('workflows/:id/approve')
  @HttpCode(HttpStatus.OK)
  async approveWorkflow(
    @Param('id') id: string,
    @Body() approveDto: ApproveWorkflowDto
  ): Promise<GovernanceWorkflow> {
    approveDto.workflowId = id;
    return this.workflowService.approveWorkflow(approveDto);
  }

  @Post('workflows/:id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectWorkflow(
    @Param('id') id: string,
    @Body() rejectDto: RejectWorkflowDto
  ): Promise<GovernanceWorkflow> {
    rejectDto.workflowId = id;
    return this.workflowService.rejectWorkflow(rejectDto);
  }

  @Post('workflows/:id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelWorkflow(
    @Param('id') id: string,
    @Body() body: { cancelledBy: string; reason: string }
  ): Promise<GovernanceWorkflow> {
    return this.workflowService.cancelWorkflow(id, body.cancelledBy, body.reason);
  }

  @Get('workflows/pending/:approverId')
  async getPendingWorkflowsForApprover(
    @Param('approverId') approverId: string
  ): Promise<GovernanceWorkflow[]> {
    return this.workflowService.getPendingWorkflowsForApprover(approverId);
  }

  @Get('statistics')
  async getWorkflowStatistics(@Query('tenantId') tenantId?: string): Promise<any> {
    return this.workflowService.getWorkflowStatistics(tenantId);
  }

  @Post('workflows/expire')
  @HttpCode(HttpStatus.OK)
  async expireWorkflows(): Promise<{ expiredCount: number }> {
    const count = await this.workflowService.expireWorkflows();
    return { expiredCount: count };
  }
}
