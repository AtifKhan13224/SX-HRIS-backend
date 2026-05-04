import { IsString, IsOptional, IsBoolean, IsObject, IsArray, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============================================================================
// TEMPLATE DTOs
// ============================================================================

export class CreateTemplateDto {
  @ApiProperty({ description: 'Template name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Template description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Template type', enum: ['ONBOARDING', 'OFFBOARDING', 'TRANSFER', 'PROMOTION', 'CUSTOM'] })
  @IsEnum(['ONBOARDING', 'OFFBOARDING', 'TRANSFER', 'PROMOTION', 'CUSTOM'])
  templateType: string;

  @ApiProperty({ description: 'Template configuration' })
  @IsObject()
  configuration: Record<string, any>;

  @ApiProperty({ description: 'Template pages' })
  @IsArray()
  pages: Record<string, any>[];

  @ApiProperty({ description: 'Workflow configuration' })
  @IsObject()
  workflow: Record<string, any>;

  @ApiProperty({ description: 'Role configurations' })
  @IsArray()
  roles: Record<string, any>[];

  @ApiProperty({ description: 'Dashboard configurations' })
  @IsArray()
  dashboards: Record<string, any>[];

  @ApiPropertyOptional({ description: 'Integration configurations' })
  @IsOptional()
  @IsArray()
  integrations?: Record<string, any>[];

  @ApiPropertyOptional({ description: 'Automation configurations' })
  @IsOptional()
  @IsArray()
  automations?: Record<string, any>[];

  @ApiPropertyOptional({ description: 'Notification configurations' })
  @IsOptional()
  @IsArray()
  notifications?: Record<string, any>[];

  @ApiPropertyOptional({ description: 'Analytics configuration' })
  @IsOptional()
  @IsObject()
  analytics?: Record<string, any>;
}

export class UpdateTemplateDto {
  @ApiPropertyOptional({ description: 'Template name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Template description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Template configuration' })
  @IsOptional()
  @IsObject()
  configuration?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Template pages' })
  @IsOptional()
  @IsArray()
  pages?: Record<string, any>[];

  @ApiPropertyOptional({ description: 'Workflow configuration' })
  @IsOptional()
  @IsObject()
  workflow?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Role configurations' })
  @IsOptional()
  @IsArray()
  roles?: Record<string, any>[];

  @ApiPropertyOptional({ description: 'Dashboard configurations' })
  @IsOptional()
  @IsArray()
  dashboards?: Record<string, any>[];

  @ApiPropertyOptional({ description: 'Integration configurations' })
  @IsOptional()
  @IsArray()
  integrations?: Record<string, any>[];

  @ApiPropertyOptional({ description: 'Automation configurations' })
  @IsOptional()
  @IsArray()
  automations?: Record<string, any>[];

  @ApiPropertyOptional({ description: 'Notification configurations' })
  @IsOptional()
  @IsArray()
  notifications?: Record<string, any>[];

  @ApiPropertyOptional({ description: 'Active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class PublishTemplateDto {
  @ApiProperty({ description: 'Publish notes' })
  @IsString()
  notes: string;
}

// ============================================================================
// INSTANCE DTOs
// ============================================================================

export class CreateInstanceDto {
  @ApiProperty({ description: 'Template ID' })
  @IsUUID()
  templateId: string;

  @ApiProperty({ description: 'Employee ID' })
  @IsUUID()
  employeeId: string;

  @ApiPropertyOptional({ description: 'Start date (ISO 8601)' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Additional participants' })
  @IsOptional()
  @IsObject()
  participants?: Record<string, string>;
}

export class UpdateInstanceDto {
  @ApiPropertyOptional({ description: 'Instance status' })
  @IsOptional()
  @IsEnum(['NOT_STARTED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED', 'FAILED'])
  status?: string;

  @ApiPropertyOptional({ description: 'Collected data' })
  @IsOptional()
  @IsObject()
  collectedData?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Participants' })
  @IsOptional()
  @IsObject()
  participants?: Record<string, string>;
}

export class UpdateInstanceProgressDto {
  @ApiProperty({ description: 'Progress percentage (0-100)' })
  progress: number;

  @ApiPropertyOptional({ description: 'Progress notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

// ============================================================================
// TASK DTOs
// ============================================================================

export class CreateTaskDto {
  @ApiProperty({ description: 'Instance ID' })
  @IsUUID()
  instanceId: string;

  @ApiProperty({ description: 'Task ID from template' })
  @IsString()
  taskId: string;

  @ApiProperty({ description: 'Phase ID' })
  @IsString()
  phaseId: string;

  @ApiProperty({ description: 'Task name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Task description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Assigned role' })
  @IsString()
  assignedTo: string;

  @ApiPropertyOptional({ description: 'Assigned user ID' })
  @IsOptional()
  @IsUUID()
  assignedUserId?: string;

  @ApiPropertyOptional({ description: 'Due date' })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Priority' })
  @IsOptional()
  @IsEnum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'])
  priority?: string;

  @ApiPropertyOptional({ description: 'Blocks advancement' })
  @IsOptional()
  @IsBoolean()
  blocksAdvancement?: boolean;

  @ApiPropertyOptional({ description: 'Requires approval' })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @ApiPropertyOptional({ description: 'Task dependencies' })
  @IsOptional()
  @IsArray()
  dependencies?: string[];
}

export class UpdateTaskDto {
  @ApiPropertyOptional({ description: 'Task status' })
  @IsOptional()
  @IsEnum(['NOT_STARTED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'CANCELLED', 'FAILED'])
  status?: string;

  @ApiPropertyOptional({ description: 'Assigned user ID' })
  @IsOptional()
  @IsUUID()
  assignedUserId?: string;

  @ApiPropertyOptional({ description: 'Due date' })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Completion notes' })
  @IsOptional()
  @IsString()
  completionNotes?: string;
}

export class AddTaskCommentDto {
  @ApiProperty({ description: 'Comment text' })
  @IsString()
  comment: string;

  @ApiProperty({ description: 'Commenter user ID' })
  @IsUUID()
  userId: string;
}

// ============================================================================
// APPROVAL DTOs
// ============================================================================

export class CreateApprovalDto {
  @ApiProperty({ description: 'Task ID' })
  @IsUUID()
  taskId: string;

  @ApiProperty({ description: 'Approver user ID' })
  @IsUUID()
  approverId: string;
}

export class UpdateApprovalDto {
  @ApiProperty({ description: 'Approval status' })
  @IsEnum(['APPROVED', 'REJECTED'])
  status: string;

  @ApiPropertyOptional({ description: 'Approval comments' })
  @IsOptional()
  @IsString()
  comments?: string;
}

// ============================================================================
// DOCUMENT DTOs
// ============================================================================

export class CreateDocumentDto {
  @ApiProperty({ description: 'Instance ID' })
  @IsUUID()
  instanceId: string;

  @ApiProperty({ description: 'Document category' })
  @IsString()
  documentCategory: string;

  @ApiProperty({ description: 'File name' })
  @IsString()
  fileName: string;

  @ApiProperty({ description: 'File path' })
  @IsString()
  filePath: string;

  @ApiProperty({ description: 'File type' })
  @IsString()
  fileType: string;

  @ApiProperty({ description: 'File size in bytes' })
  fileSize: number;

  @ApiPropertyOptional({ description: 'Is required document' })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiProperty({ description: 'Uploaded by user ID' })
  @IsUUID()
  uploadedBy: string;
}

export class UpdateDocumentDto {
  @ApiPropertyOptional({ description: 'Document status' })
  @IsOptional()
  @IsEnum(['PENDING', 'VERIFIED', 'REJECTED'])
  status?: string;

  @ApiPropertyOptional({ description: 'Verified by user ID' })
  @IsOptional()
  @IsUUID()
  verifiedBy?: string;

  @ApiPropertyOptional({ description: 'Virus scan completed' })
  @IsOptional()
  @IsBoolean()
  virusScanCompleted?: boolean;

  @ApiPropertyOptional({ description: 'Virus scan passed' })
  @IsOptional()
  @IsBoolean()
  virusScanPassed?: boolean;

  @ApiPropertyOptional({ description: 'OCR completed' })
  @IsOptional()
  @IsBoolean()
  ocrCompleted?: boolean;

  @ApiPropertyOptional({ description: 'OCR extracted text' })
  @IsOptional()
  @IsString()
  ocrText?: string;
}

// ============================================================================
// ANALYTICS DTOs
// ============================================================================

export class AnalyticsQueryDto {
  @ApiPropertyOptional({ description: 'Start date for analytics' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for analytics' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Employee types filter' })
  @IsOptional()
  @IsArray()
  employeeTypes?: string[];

  @ApiPropertyOptional({ description: 'Departments filter' })
  @IsOptional()
  @IsArray()
  departments?: string[];

  @ApiPropertyOptional({ description: 'Business units filter' })
  @IsOptional()
  @IsArray()
  businessUnits?: string[];

  @ApiPropertyOptional({ description: 'Locations filter' })
  @IsOptional()
  @IsArray()
  locations?: string[];
}

export class BulkActionDto {
  @ApiProperty({ description: 'Instance IDs' })
  @IsArray()
  @IsUUID('4', { each: true })
  instanceIds: string[];

  @ApiProperty({ description: 'Action to perform' })
  @IsEnum(['SEND_REMINDER', 'UPDATE_STATUS', 'ASSIGN_TASK', 'CANCEL'])
  action: string;

  @ApiPropertyOptional({ description: 'Action payload' })
  @IsOptional()
  @IsObject()
  payload?: Record<string, any>;
}

// ============================================================================
// QUERY DTOs
// ============================================================================

export class QueryTemplatesDto {
  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Template type filter' })
  @IsOptional()
  @IsEnum(['ONBOARDING', 'OFFBOARDING', 'TRANSFER', 'PROMOTION', 'CUSTOM'])
  templateType?: string;

  @ApiPropertyOptional({ description: 'Active status filter' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Published status filter' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'Page number' })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page' })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Sort by field' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort direction' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortDir?: string;
}

export class QueryInstancesDto {
  @ApiPropertyOptional({ description: 'Template ID filter' })
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @ApiPropertyOptional({ description: 'Employee ID filter' })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @ApiPropertyOptional({ description: 'Status filter' })
  @IsOptional()
  @IsEnum(['NOT_STARTED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED', 'FAILED'])
  status?: string;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Start date filter (from)' })
  @IsOptional()
  @IsString()
  startDateFrom?: string;

  @ApiPropertyOptional({ description: 'Start date filter (to)' })
  @IsOptional()
  @IsString()
  startDateTo?: string;

  @ApiPropertyOptional({ description: 'Page number' })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page' })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Sort by field' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort direction' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortDir?: string;
}
