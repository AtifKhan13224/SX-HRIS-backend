import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ProjectConfigurationVersion,
  ProjectConfigurationDependency,
  ProjectConfigurationAuditLog,
  ProjectConfigurationScopeMapping,
} from '../entities/project-config.entity';

/**
 * PROJECT CONFIGURATION SERVICE
 * Cross-cutting service for versioning, dependencies, audit, and scope
 * 
 * Provides shared functionality for all configuration entities:
 * - Version management
 * - Dependency tracking
 * - Audit logging
 * - Scope mappings
 */
@Injectable()
export class ProjectConfigurationService {
  constructor(
    @InjectRepository(ProjectConfigurationVersion)
    private readonly versionRepository: Repository<ProjectConfigurationVersion>,
    @InjectRepository(ProjectConfigurationDependency)
    private readonly dependencyRepository: Repository<ProjectConfigurationDependency>,
    @InjectRepository(ProjectConfigurationAuditLog)
    private readonly auditLogRepository: Repository<ProjectConfigurationAuditLog>,
    @InjectRepository(ProjectConfigurationScopeMapping)
    private readonly scopeMappingRepository: Repository<ProjectConfigurationScopeMapping>,
  ) {}

  /**
   * Create version record
   */
  async createVersion(data: {
    tenantId: string;
    configurationType: string;
    configurationId: string;
    versionNumber: number;
    changeType: string;
    changeDescription?: string;
    configurationSnapshot: any;
    changedFields?: any;
    changedBy: string;
    effectiveFrom: Date;
    effectiveTo?: Date;
    changeReason?: string;
    approvedBy?: string;
    approvedAt?: Date;
  }): Promise<ProjectConfigurationVersion> {
    const version = this.versionRepository.create(data);
    return this.versionRepository.save(version);
  }

  /**
   * Get version history
   */
  async getVersionHistory(
    configurationType: string,
    configurationId: string,
    tenantId: string,
  ): Promise<ProjectConfigurationVersion[]> {
    return this.versionRepository.find({
      where: {
        tenantId,
        configurationType,
        configurationId,
      },
      order: { versionNumber: 'DESC' },
    });
  }

  /**
   * Create dependency record
   */
  async createDependency(data: {
    tenantId: string;
    sourceConfigType: string;
    sourceConfigId: string;
    dependentEntityType: string;
    dependentEntityId: string;
    dependentEntityName?: string;
    dependencyType?: string;
    isBlocking?: boolean;
    dependencyMetadata?: any;
    createdBy: string;
  }): Promise<ProjectConfigurationDependency> {
    const dependency = this.dependencyRepository.create(data);
    return this.dependencyRepository.save(dependency);
  }

  /**
   * Check dependencies
   */
  async checkDependencies(
    configType: string,
    configId: string,
    tenantId: string,
  ): Promise<ProjectConfigurationDependency[]> {
    return this.dependencyRepository.find({
      where: {
        tenantId,
        sourceConfigType: configType,
        sourceConfigId: configId,
      },
    });
  }

  /**
   * Remove dependency
   */
  async removeDependency(
    id: string,
    tenantId: string,
  ): Promise<void> {
    await this.dependencyRepository.delete({ id, tenantId });
  }

  /**
   * Create audit log
   */
  async createAuditLog(data: {
    tenantId: string;
    configurationType: string;
    configurationId: string;
    configurationCode?: string;
    actionType: string;
    actionDescription?: string;
    beforeState?: any;
    afterState?: any;
    changedFields?: string[];
    performedBy: string;
    performedByName?: string;
    performedByRole?: string;
    ipAddress?: string;
    userAgent?: string;
    changeReason?: string;
    approvalStatus?: string;
  }): Promise<ProjectConfigurationAuditLog> {
    const auditLog = this.auditLogRepository.create({
      ...data,
      performedAt: new Date(),
    });
    return this.auditLogRepository.save(auditLog);
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(
    configurationType: string,
    configurationId: string,
    tenantId: string,
  ): Promise<ProjectConfigurationAuditLog[]> {
    return this.auditLogRepository.find({
      where: {
        tenantId,
        configurationType,
        configurationId,
      },
      order: { performedAt: 'DESC' },
    });
  }

  /**
   * Create scope mapping
   */
  async createScopeMapping(data: {
    tenantId: string;
    configurationType: string;
    configurationId: string;
    scopeType: string;
    scopeEntityId: string;
    scopeEntityName?: string;
    isPrimary?: boolean;
    effectiveStartDate: Date;
    effectiveEndDate?: Date;
    createdBy: string;
  }): Promise<ProjectConfigurationScopeMapping> {
    const mapping = this.scopeMappingRepository.create(data);
    return this.scopeMappingRepository.save(mapping);
  }

  /**
   * Get scope mappings
   */
  async getScopeMappings(
    configurationType: string,
    configurationId: string,
    tenantId: string,
  ): Promise<ProjectConfigurationScopeMapping[]> {
    return this.scopeMappingRepository.find({
      where: {
        tenantId,
        configurationType,
        configurationId,
      },
    });
  }
}
