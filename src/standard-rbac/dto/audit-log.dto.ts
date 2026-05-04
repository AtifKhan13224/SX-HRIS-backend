import { IsString, IsEnum, IsOptional, IsArray, IsObject, IsDateString } from 'class-validator';
import { AuditEventType, AuditSeverity } from '../entities/audit-log.entity';

export class CreateAuditLogDto {
  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  userName?: string;

  @IsEnum(AuditEventType)
  eventType: AuditEventType;

  @IsEnum(AuditSeverity)
  severity: AuditSeverity;

  @IsString()
  eventDescription: string;

  @IsOptional()
  @IsString()
  roleId?: string;

  @IsOptional()
  @IsString()
  roleCode?: string;

  @IsOptional()
  @IsString()
  permissionId?: string;

  @IsOptional()
  @IsString()
  permissionCode?: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsString()
  fieldName?: string;

  @IsOptional()
  @IsString()
  oldValue?: string;

  @IsOptional()
  @IsString()
  newValue?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  requestUrl?: string;

  @IsOptional()
  @IsString()
  httpMethod?: string;

  @IsOptional()
  @IsString()
  httpStatusCode?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  complianceFrameworks?: string[];

  @IsOptional()
  @IsObject()
  contextData?: Record<string, any>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  geolocation?: string;
}

export class QueryAuditLogDto {
  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(AuditEventType)
  eventType?: AuditEventType;

  @IsOptional()
  @IsEnum(AuditSeverity)
  severity?: AuditSeverity;

  @IsOptional()
  @IsString()
  roleId?: string;

  @IsOptional()
  @IsString()
  permissionId?: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  complianceFrameworks?: string[];
}
