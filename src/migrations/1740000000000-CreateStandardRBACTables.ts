import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateStandardRBACTables1740000000000 implements MigrationInterface {
  name = 'CreateStandardRBACTables1740000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create system_roles table
    await queryRunner.createTable(
      new Table({
        name: 'system_roles',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'roleCode', type: 'varchar', length: '100', isUnique: true },
          { name: 'roleName', type: 'varchar', length: '255' },
          { name: 'roleDescription', type: 'text', isNullable: true },
          { name: 'roleCategory', type: 'varchar', length: '50' },
          { name: 'sensitivityLevel', type: 'varchar', length: '20', default: "'LOW'" },
          { name: 'privilegedRole', type: 'boolean', default: false },
          { name: 'breakGlassRole', type: 'boolean', default: false },
          { name: 'systemLocked', type: 'boolean', default: true },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'effectiveFrom', type: 'date', isNullable: true },
          { name: 'effectiveTo', type: 'date', isNullable: true },
          { name: 'tenantId', type: 'varchar', length: '100', isNullable: true },
          { name: 'multiTenantEnabled', type: 'boolean', default: false },
          { name: 'allowedTenantIds', type: 'text', isNullable: true },
          { name: 'version', type: 'int', default: 1 },
          { name: 'displayOrder', type: 'int', default: 0 },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'complianceTags', type: 'jsonb', isNullable: true },
          { name: 'regulatoryMapping', type: 'jsonb', isNullable: true },
          { name: 'requiresDualApproval', type: 'boolean', default: false },
          { name: 'requiresJustification', type: 'boolean', default: false },
          { name: 'maxAssignments', type: 'int', default: 0 },
          { name: 'currentAssignments', type: 'int', default: 0 },
          { name: 'parentRoleCode', type: 'varchar', length: '255', isNullable: true },
          { name: 'isTemplate', type: 'boolean', default: false },
          { name: 'allowCustomization', type: 'boolean', default: true },
          { name: 'customizationConstraints', type: 'jsonb', isNullable: true },
          { name: 'lastModifiedAt', type: 'timestamp', isNullable: true },
          { name: 'lastModifiedBy', type: 'varchar', length: '100', isNullable: true },
          { name: 'modificationReason', type: 'text', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'createdBy', type: 'varchar', length: '100' },
        ],
      }),
      true
    );

    await queryRunner.createIndex('system_roles', new TableIndex({ name: 'IDX_system_roles_roleCode', columnNames: ['roleCode'] }));
    await queryRunner.createIndex('system_roles', new TableIndex({ name: 'IDX_system_roles_tenantId_isActive', columnNames: ['tenantId', 'isActive'] }));
    await queryRunner.createIndex('system_roles', new TableIndex({ name: 'IDX_system_roles_sensitivityLevel_tenantId', columnNames: ['sensitivityLevel', 'tenantId'] }));
    await queryRunner.createIndex('system_roles', new TableIndex({ name: 'IDX_system_roles_privilegedRole_tenantId', columnNames: ['privilegedRole', 'tenantId'] }));

    // Create permission_registry table
    await queryRunner.createTable(
      new Table({
        name: 'permission_registry',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'permissionCode', type: 'varchar', length: '150', isUnique: true },
          { name: 'permissionName', type: 'varchar', length: '255' },
          { name: 'permissionDescription', type: 'text', isNullable: true },
          { name: 'module', type: 'varchar', length: '50' },
          { name: 'subModule', type: 'varchar', length: '100', isNullable: true },
          { name: 'feature', type: 'varchar', length: '100', isNullable: true },
          { name: 'action', type: 'varchar', length: '50' },
          { name: 'permissionTags', type: 'text', isNullable: true },
          { name: 'isSensitive', type: 'boolean', default: false },
          { name: 'isFinancial', type: 'boolean', default: false },
          { name: 'isPII', type: 'boolean', default: false },
          { name: 'requiresCompliance', type: 'boolean', default: false },
          { name: 'requiresSoD', type: 'boolean', default: false },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'riskScore', type: 'int', default: 1 },
          { name: 'dependencies', type: 'jsonb', isNullable: true },
          { name: 'exclusions', type: 'jsonb', isNullable: true },
          { name: 'prerequisites', type: 'jsonb', isNullable: true },
          { name: 'requiresDataScope', type: 'boolean', default: false },
          { name: 'requiresFieldSecurity', type: 'boolean', default: false },
          { name: 'allowDelegation', type: 'boolean', default: false },
          { name: 'maxDelegationLevel', type: 'int', default: 0 },
          { name: 'apiEndpoints', type: 'jsonb', isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'complianceMapping', type: 'jsonb', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'createdBy', type: 'varchar', length: '100' },
        ],
      }),
      true
    );

    await queryRunner.createIndex('permission_registry', new TableIndex({ name: 'IDX_permission_registry_permissionCode', columnNames: ['permissionCode'] }));
    await queryRunner.createIndex('permission_registry', new TableIndex({ name: 'IDX_permission_registry_module_subModule_isActive', columnNames: ['module', 'subModule', 'isActive'] }));
    await queryRunner.createIndex('permission_registry', new TableIndex({ name: 'IDX_permission_registry_requiresSoD_isActive', columnNames: ['requiresSoD', 'isActive'] }));

    // Create system_role_permissions table
    await queryRunner.createTable(
      new Table({
        name: 'system_role_permissions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'systemRoleId', type: 'uuid' },
          { name: 'permissionId', type: 'uuid' },
          { name: 'grantType', type: 'varchar', length: '20', default: "'ALLOW'" },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'effectiveFrom', type: 'date', isNullable: true },
          { name: 'effectiveTo', type: 'date', isNullable: true },
          { name: 'isConditional', type: 'boolean', default: false },
          { name: 'conditions', type: 'jsonb', isNullable: true },
          { name: 'requiresDataScope', type: 'boolean', default: false },
          { name: 'dataScopeConfigId', type: 'uuid', isNullable: true },
          { name: 'requiresFieldSecurity', type: 'boolean', default: false },
          { name: 'fieldRestrictions', type: 'jsonb', isNullable: true },
          { name: 'allowOverride', type: 'boolean', default: false },
          { name: 'overrideApprover', type: 'varchar', length: '100', isNullable: true },
          { name: 'auditRequired', type: 'boolean', default: false },
          { name: 'runtimeConstraints', type: 'jsonb', isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'createdBy', type: 'varchar', length: '100' },
        ],
      }),
      true
    );

    await queryRunner.createIndex('system_role_permissions', new TableIndex({ name: 'IDX_system_role_permissions_systemRoleId_permissionId', columnNames: ['systemRoleId', 'permissionId'], isUnique: true }));
    await queryRunner.createIndex('system_role_permissions', new TableIndex({ name: 'IDX_system_role_permissions_systemRoleId_isActive', columnNames: ['systemRoleId', 'isActive'] }));
    await queryRunner.createIndex('system_role_permissions', new TableIndex({ name: 'IDX_system_role_permissions_permissionId_grantType', columnNames: ['permissionId', 'grantType'] }));

    // Create foreign keys for system_role_permissions
    await queryRunner.createForeignKey('system_role_permissions', new TableForeignKey({
      columnNames: ['systemRoleId'],
      referencedTableName: 'system_roles',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));

    await queryRunner.createForeignKey('system_role_permissions', new TableForeignKey({
      columnNames: ['permissionId'],
      referencedTableName: 'permission_registry',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));

    // Continue with other tables in next part due to length...
    await this.createDataScopeTables(queryRunner);
    await this.createFieldSecurityTables(queryRunner);
    await this.createSoDTables(queryRunner);
    await this.createGovernanceTables(queryRunner);
    await this.createAuditTables(queryRunner);
    await this.createVersionTables(queryRunner);
  }

  private async createDataScopeTables(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'data_scope_config',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'scopeCode', type: 'varchar', length: '100', isUnique: true },
          { name: 'scopeName', type: 'varchar', length: '255' },
          { name: 'scopeDescription', type: 'text', isNullable: true },
          { name: 'scopeType', type: 'varchar', length: '50' },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'tenantId', type: 'varchar', length: '100', isNullable: true },
          { name: 'isHierarchical', type: 'boolean', default: false },
          { name: 'includeChildren', type: 'boolean', default: false },
          { name: 'hierarchyDepth', type: 'int', default: 0 },
          { name: 'scopeValues', type: 'text', isNullable: true },
          { name: 'scopeLogic', type: 'varchar', length: '10', default: "'OR'" },
          { name: 'layeredScopes', type: 'jsonb', isNullable: true },
          { name: 'dynamicResolution', type: 'boolean', default: false },
          { name: 'resolutionRule', type: 'text', isNullable: true },
          { name: 'filters', type: 'jsonb', isNullable: true },
          { name: 'reportingLineConfig', type: 'jsonb', isNullable: true },
          { name: 'geographicScope', type: 'jsonb', isNullable: true },
          { name: 'temporalScope', type: 'jsonb', isNullable: true },
          { name: 'exclusions', type: 'text', isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'createdBy', type: 'varchar', length: '100' },
        ],
      }),
      true
    );

    await queryRunner.createIndex('data_scope_config', new TableIndex({ name: 'IDX_data_scope_config_scopeCode', columnNames: ['scopeCode'] }));
    await queryRunner.createIndex('data_scope_config', new TableIndex({ name: 'IDX_data_scope_config_tenantId_isActive', columnNames: ['tenantId', 'isActive'] }));
  }

  private async createFieldSecurityTables(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'field_level_security',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'permissionId', type: 'uuid' },
          { name: 'entityType', type: 'varchar', length: '100' },
          { name: 'fieldName', type: 'varchar', length: '100' },
          { name: 'fieldDisplayName', type: 'varchar', length: '255', isNullable: true },
          { name: 'securityAction', type: 'varchar', length: '20' },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'tenantId', type: 'varchar', length: '100', isNullable: true },
          { name: 'countryCode', type: 'varchar', length: '10', isNullable: true },
          { name: 'isCountrySpecific', type: 'boolean', default: false },
          { name: 'isConditional', type: 'boolean', default: false },
          { name: 'conditions', type: 'jsonb', isNullable: true },
          { name: 'maskingType', type: 'varchar', length: '50', isNullable: true },
          { name: 'maskingChar', type: 'varchar', length: '10', isNullable: true },
          { name: 'visibleChars', type: 'int', isNullable: true },
          { name: 'partialVisibilityConfig', type: 'jsonb', isNullable: true },
          { name: 'allowExport', type: 'boolean', default: false },
          { name: 'allowPrint', type: 'boolean', default: false },
          { name: 'requiresApprovalToView', type: 'boolean', default: false },
          { name: 'approverRole', type: 'varchar', length: '100', isNullable: true },
          { name: 'viewDurationMinutes', type: 'int', default: 0 },
          { name: 'auditOnAccess', type: 'boolean', default: false },
          { name: 'allowedValues', type: 'jsonb', isNullable: true },
          { name: 'validationRules', type: 'jsonb', isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'createdBy', type: 'varchar', length: '100' },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey('field_level_security', new TableForeignKey({
      columnNames: ['permissionId'],
      referencedTableName: 'permission_registry',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));
  }

  private async createSoDTables(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'sod_policies',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'policyCode', type: 'varchar', length: '100', isUnique: true },
          { name: 'policyName', type: 'varchar', length: '255' },
          { name: 'policyDescription', type: 'text', isNullable: true },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'isEnforced', type: 'boolean', default: true },
          { name: 'tenantId', type: 'varchar', length: '100', isNullable: true },
          { name: 'conflictingRole1', type: 'uuid' },
          { name: 'conflictingRole2', type: 'uuid' },
          { name: 'conflictingPermissions', type: 'text', isNullable: true },
          { name: 'conflictSeverity', type: 'varchar', length: '20', default: "'MEDIUM'" },
          { name: 'conflictAction', type: 'varchar', length: '30', default: "'WARN'" },
          { name: 'businessJustification', type: 'text', isNullable: true },
          { name: 'mitigatingControls', type: 'text', isNullable: true },
          { name: 'regulatoryFrameworks', type: 'text', isNullable: true },
          { name: 'complianceMapping', type: 'jsonb', isNullable: true },
          { name: 'requiresException', type: 'boolean', default: false },
          { name: 'exceptionApproverRole', type: 'text', isNullable: true },
          { name: 'exceptionValidityDays', type: 'int', isNullable: true },
          { name: 'requiresPeriodicReview', type: 'boolean', default: false },
          { name: 'reviewFrequencyDays', type: 'int', default: 90 },
          { name: 'lastReviewedAt', type: 'timestamp', isNullable: true },
          { name: 'lastReviewedBy', type: 'varchar', length: '100', isNullable: true },
          { name: 'auditFlags', type: 'jsonb', isNullable: true },
          { name: 'riskMetrics', type: 'jsonb', isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'createdBy', type: 'varchar', length: '100' },
        ],
      }),
      true
    );
  }

  private async createGovernanceTables(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'governance_workflows',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'requestId', type: 'varchar', length: '100', isUnique: true },
          { name: 'workflowType', type: 'varchar', length: '50' },
          { name: 'workflowStatus', type: 'varchar', length: '20', default: "'PENDING'" },
          { name: 'requestorId', type: 'varchar', length: '100' },
          { name: 'tenantId', type: 'varchar', length: '100', isNullable: true },
          { name: 'targetRoleId', type: 'uuid', isNullable: true },
          { name: 'targetUserId', type: 'varchar', length: '100', isNullable: true },
          { name: 'requestPayload', type: 'jsonb', isNullable: true },
          { name: 'justification', type: 'text' },
          { name: 'businessReason', type: 'text', isNullable: true },
          { name: 'requiresDualApproval', type: 'boolean', default: false },
          { name: 'requiredApprovals', type: 'int', default: 1 },
          { name: 'receivedApprovals', type: 'int', default: 0 },
          { name: 'approvalChain', type: 'jsonb', isNullable: true },
          { name: 'currentApprovers', type: 'jsonb', isNullable: true },
          { name: 'submittedAt', type: 'timestamp', isNullable: true },
          { name: 'approvedAt', type: 'timestamp', isNullable: true },
          { name: 'rejectedAt', type: 'timestamp', isNullable: true },
          { name: 'approvedBy', type: 'varchar', length: '100', isNullable: true },
          { name: 'rejectedBy', type: 'varchar', length: '100', isNullable: true },
          { name: 'rejectionReason', type: 'text', isNullable: true },
          { name: 'expiresAt', type: 'timestamp', isNullable: true },
          { name: 'isExpired', type: 'boolean', default: false },
          { name: 'isUrgent', type: 'boolean', default: false },
          { name: 'priority', type: 'int', default: 5 },
          { name: 'riskAssessment', type: 'jsonb', isNullable: true },
          { name: 'complianceChecks', type: 'jsonb', isNullable: true },
          { name: 'auditTrail', type: 'jsonb', isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true
    );
  }

  private async createAuditTables(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'rbac_audit_logs',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'tenantId', type: 'varchar', length: '100', isNullable: true },
          { name: 'userId', type: 'varchar', length: '100' },
          { name: 'userName', type: 'varchar', length: '255', isNullable: true },
          { name: 'eventType', type: 'varchar', length: '50' },
          { name: 'severity', type: 'varchar', length: '20', default: "'INFO'" },
          { name: 'eventDescription', type: 'text' },
          { name: 'roleId', type: 'uuid', isNullable: true },
          { name: 'roleCode', type: 'varchar', length: '100', isNullable: true },
          { name: 'permissionId', type: 'uuid', isNullable: true },
          { name: 'permissionCode', type: 'varchar', length: '150', isNullable: true },
          { name: 'entityType', type: 'varchar', length: '100', isNullable: true },
          { name: 'entityId', type: 'varchar', length: '100', isNullable: true },
          { name: 'fieldName', type: 'varchar', length: '100', isNullable: true },
          { name: 'oldValue', type: 'text', isNullable: true },
          { name: 'newValue', type: 'text', isNullable: true },
          { name: 'ipAddress', type: 'varchar', length: '100', isNullable: true },
          { name: 'userAgent', type: 'text', isNullable: true },
          { name: 'sessionId', type: 'varchar', length: '100', isNullable: true },
          { name: 'requestUrl', type: 'text', isNullable: true },
          { name: 'httpMethod', type: 'varchar', length: '20', isNullable: true },
          { name: 'httpStatusCode', type: 'int', isNullable: true },
          { name: 'complianceRelevant', type: 'boolean', default: false },
          { name: 'complianceFrameworks', type: 'text', isNullable: true },
          { name: 'isAnomaly', type: 'boolean', default: false },
          { name: 'riskScore', type: 'float', isNullable: true },
          { name: 'contextData', type: 'jsonb', isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'geolocation', type: 'varchar', length: '100', isNullable: true },
          { name: 'requiresReview', type: 'boolean', default: false },
          { name: 'reviewedBy', type: 'varchar', length: '100', isNullable: true },
          { name: 'reviewedAt', type: 'timestamp', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true
    );

    await queryRunner.createIndex('rbac_audit_logs', new TableIndex({ name: 'IDX_rbac_audit_logs_tenantId_eventType_createdAt', columnNames: ['tenantId', 'eventType', 'createdAt'] }));
    await queryRunner.createIndex('rbac_audit_logs', new TableIndex({ name: 'IDX_rbac_audit_logs_userId_eventType_createdAt', columnNames: ['userId', 'eventType', 'createdAt'] }));
  }

  private async createVersionTables(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'system_role_versions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'systemRoleId', type: 'uuid' },
          { name: 'versionNumber', type: 'int' },
          { name: 'changeType', type: 'varchar', length: '50' },
          { name: 'snapshotData', type: 'jsonb' },
          { name: 'permissionsSnapshot', type: 'jsonb', isNullable: true },
          { name: 'changesSummary', type: 'jsonb', isNullable: true },
          { name: 'changeReason', type: 'text', isNullable: true },
          { name: 'approvalReference', type: 'text', isNullable: true },
          { name: 'changedBy', type: 'varchar', length: '100' },
          { name: 'changedByName', type: 'varchar', length: '255', isNullable: true },
          { name: 'approvedBy', type: 'varchar', length: '100', isNullable: true },
          { name: 'approvedAt', type: 'timestamp', isNullable: true },
          { name: 'isRollbackVersion', type: 'boolean', default: false },
          { name: 'rollbackFromVersionId', type: 'uuid', isNullable: true },
          { name: 'complianceSignoff', type: 'jsonb', isNullable: true },
          { name: 'regulatoryAudit', type: 'jsonb', isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true
    );

    await queryRunner.createForeignKey('system_role_versions', new TableForeignKey({
      columnNames: ['systemRoleId'],
      referencedTableName: 'system_roles',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('system_role_versions');
    await queryRunner.dropTable('rbac_audit_logs');
    await queryRunner.dropTable('governance_workflows');
    await queryRunner.dropTable('sod_policies');
    await queryRunner.dropTable('field_level_security');
    await queryRunner.dropTable('data_scope_config');
    await queryRunner.dropTable('system_role_permissions');
    await queryRunner.dropTable('permission_registry');
    await queryRunner.dropTable('system_roles');
  }
}
