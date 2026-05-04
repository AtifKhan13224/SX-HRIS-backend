import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateRBACTables1709500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create rbac_standard_roles table
    await queryRunner.createTable(
      new Table({
        name: 'rbac_standard_roles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'roleCode', type: 'varchar', length: '100', isUnique: true },
          { name: 'roleName', type: 'varchar', length: '255' },
          { name: 'roleDescription', type: 'text', isNullable: true },
          { name: 'roleCategory', type: 'varchar', length: '100' },
          { name: 'isSystemOwned', type: 'boolean', default: true },
          { name: 'tenantId', type: 'uuid', isNullable: true },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'isArchived', type: 'boolean', default: false },
          { name: 'displayOrder', type: 'integer', default: 0 },
          { name: 'isModifiable', type: 'boolean', default: false },
          { name: 'requiresDualApproval', type: 'boolean', default: false },
          { name: 'requiresChangeJustification', type: 'boolean', default: false },
          { name: 'hasRollbackCapability', type: 'boolean', default: true },
          { name: 'isEmergencyAccessRole', type: 'boolean', default: false },
          { name: 'roleVersion', type: 'integer', default: 1 },
          { name: 'entityVersion', type: 'integer', default: 0 },
          { name: 'defaultDataScope', type: 'varchar', length: '100' },
          { name: 'allowedCountries', type: 'text', isNullable: true },
          { name: 'restrictedCountries', type: 'text', isNullable: true },
          { name: 'canAccessSensitiveData', type: 'boolean', default: false },
          { name: 'canExportData', type: 'boolean', default: false },
          { name: 'canDownloadReports', type: 'boolean', default: false },
          { name: 'canApproveTransactions', type: 'boolean', default: false },
          { name: 'maskedFields', type: 'jsonb', isNullable: true },
          { name: 'hiddenFields', type: 'jsonb', isNullable: true },
          { name: 'readOnlyFields', type: 'jsonb', isNullable: true },
          { name: 'editableFields', type: 'jsonb', isNullable: true },
          { name: 'honorsInCoreHR', type: 'boolean', default: true },
          { name: 'honorsInPayroll', type: 'boolean', default: true },
          { name: 'honorsInLeave', type: 'boolean', default: true },
          { name: 'honorsInRecruitment', type: 'boolean', default: true },
          { name: 'honorsInReports', type: 'boolean', default: true },
          { name: 'honorsInAPIs', type: 'boolean', default: false },
          { name: 'complianceTags', type: 'text', isNullable: true },
          { name: 'isGDPRCompliant', type: 'boolean', default: false },
          { name: 'isSOXCompliant', type: 'boolean', default: false },
          { name: 'isAuditableRole', type: 'boolean', default: false },
          { name: 'conflictingRoles', type: 'jsonb', isNullable: true },
          { name: 'requiredRoles', type: 'jsonb', isNullable: true },
          { name: 'mutuallyExclusiveWith', type: 'jsonb', isNullable: true },
          { name: 'effectiveFrom', type: 'timestamp', isNullable: true },
          { name: 'effectiveTo', type: 'timestamp', isNullable: true },
          { name: 'maxAssignmentDurationDays', type: 'integer', isNullable: true },
          { name: 'customAttributes', type: 'jsonb', isNullable: true },
          { name: 'businessRules', type: 'jsonb', isNullable: true },
          { name: 'securityNotes', type: 'text', isNullable: true },
          { name: 'usageGuidelines', type: 'text', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'createdBy', type: 'uuid', isNullable: true },
          { name: 'updatedBy', type: 'uuid', isNullable: true },
          { name: 'approvedBy', type: 'uuid', isNullable: true },
          { name: 'approvedAt', type: 'timestamp', isNullable: true },
          { name: 'approvalStatus', type: 'varchar', length: '50', isNullable: true },
          { name: 'lastChangeReason', type: 'text', isNullable: true },
        ],
      }),
      true,
    );

    // Create rbac_permissions table
    await queryRunner.createTable(
      new Table({
        name: 'rbac_permissions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'permissionCode', type: 'varchar', length: '100', isUnique: true },
          { name: 'permissionName', type: 'varchar', length: '255' },
          { name: 'permissionDescription', type: 'text', isNullable: true },
          { name: 'module', type: 'varchar', length: '100' },
          { name: 'subModule', type: 'varchar', length: '100', isNullable: true },
          { name: 'feature', type: 'varchar', length: '100', isNullable: true },
          { name: 'action', type: 'varchar', length: '50' },
          { name: 'category', type: 'varchar', length: '100', isNullable: true },
          { name: 'subCategory', type: 'varchar', length: '100', isNullable: true },
          { name: 'isSystemPermission', type: 'boolean', default: false },
          { name: 'isSensitive', type: 'boolean', default: false },
          { name: 'requiresApproval', type: 'boolean', default: false },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'riskLevel', type: 'integer', default: 0 },
          { name: 'allowsDataExport', type: 'boolean', default: false },
          { name: 'allowsBulkOperation', type: 'boolean', default: false },
          { name: 'accessesPII', type: 'boolean', default: false },
          { name: 'accessesFinancialData', type: 'boolean', default: false },
          { name: 'scopeConstraints', type: 'jsonb', isNullable: true },
          { name: 'dependsOnPermissions', type: 'text', isNullable: true },
          { name: 'conflictsWithPermissions', type: 'text', isNullable: true },
          { name: 'impliesPermissions', type: 'text', isNullable: true },
          { name: 'complianceRequirements', type: 'text', isNullable: true },
          { name: 'requiresAuditLog', type: 'boolean', default: true },
          { name: 'requiresMFA', type: 'boolean', default: false },
          { name: 'allowedCountries', type: 'text', isNullable: true },
          { name: 'blockedCountries', type: 'text', isNullable: true },
          { name: 'maxOperationsPerHour', type: 'integer', isNullable: true },
          { name: 'maxOperationsPerDay', type: 'integer', isNullable: true },
          { name: 'maxBulkRecords', type: 'integer', isNullable: true },
          { name: 'timeRestrictions', type: 'jsonb', isNullable: true },
          { name: 'displayGroup', type: 'varchar', length: '100', isNullable: true },
          { name: 'displayOrder', type: 'integer', default: 0 },
          { name: 'iconName', type: 'varchar', length: '50', isNullable: true },
          { name: 'badgeColor', type: 'varchar', length: '50', isNullable: true },
          { name: 'apiEndpoint', type: 'varchar', length: '255', isNullable: true },
          { name: 'httpMethod', type: 'varchar', length: '10', isNullable: true },
          { name: 'applicableModules', type: 'text', isNullable: true },
          { name: 'customMetadata', type: 'jsonb', isNullable: true },
          { name: 'usageNotes', type: 'text', isNullable: true },
          { name: 'securityNotes', type: 'text', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'createdBy', type: 'uuid', isNullable: true },
          { name: 'updatedBy', type: 'uuid', isNullable: true },
        ],
      }),
      true,
    );

    // Create rbac_role_permissions table
    await queryRunner.createTable(
      new Table({
        name: 'rbac_role_permissions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'roleId', type: 'uuid' },
          { name: 'permissionId', type: 'uuid' },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'isReadOnly', type: 'boolean', default: false },
          { name: 'isConditional', type: 'boolean', default: false },
          { name: 'dataScope', type: 'varchar', length: '100', isNullable: true },
          { name: 'scopeFilters', type: 'text', isNullable: true },
          { name: 'scopeConditions', type: 'jsonb', isNullable: true },
          { name: 'allowedFields', type: 'text', isNullable: true },
          { name: 'deniedFields', type: 'text', isNullable: true },
          { name: 'maskedFields', type: 'text', isNullable: true },
          { name: 'readOnlyFields', type: 'text', isNullable: true },
          { name: 'requiresApproval', type: 'boolean', default: false },
          { name: 'approvalLevel', type: 'integer', isNullable: true },
          { name: 'approverRoles', type: 'text', isNullable: true },
          { name: 'validFrom', type: 'timestamp', isNullable: true },
          { name: 'validTo', type: 'timestamp', isNullable: true },
          { name: 'timeConstraints', type: 'jsonb', isNullable: true },
          { name: 'maxRecordsPerOperation', type: 'integer', isNullable: true },
          { name: 'maxOperationsPerHour', type: 'integer', isNullable: true },
          { name: 'maxOperationsPerDay', type: 'integer', isNullable: true },
          { name: 'allowExport', type: 'boolean', default: false },
          { name: 'allowImport', type: 'boolean', default: false },
          { name: 'allowBulkOperations', type: 'boolean', default: false },
          { name: 'conditions', type: 'jsonb', isNullable: true },
          { name: 'isAudited', type: 'boolean', default: true },
          { name: 'complianceTags', type: 'text', isNullable: true },
          { name: 'justificationRequired', type: 'text', isNullable: true },
          { name: 'requiresMFA', type: 'boolean', default: false },
          { name: 'version', type: 'integer', default: 1 },
          { name: 'changeReason', type: 'text', isNullable: true },
          { name: 'approvedBy', type: 'uuid', isNullable: true },
          { name: 'approvedAt', type: 'timestamp', isNullable: true },
          { name: 'riskScore', type: 'integer', default: 0 },
          { name: 'riskCategory', type: 'varchar', length: '50', isNullable: true },
          { name: 'riskNotes', type: 'text', isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'createdBy', type: 'uuid', isNullable: true },
          { name: 'updatedBy', type: 'uuid', isNullable: true },
          { name: 'lastAccessedAt', type: 'timestamp', isNullable: true },
          { name: 'usageCount', type: 'integer', default: 0 },
        ],
      }),
      true,
    );

    // Create remaining RBAC tables...
    // rbac_role_audit_logs, rbac_role_version_snapshots, rbac_sod_policies

    // Add foreign keys
    await queryRunner.createForeignKey(
      'rbac_role_permissions',
      new TableForeignKey({
        columnNames: ['roleId'],
        referencedTableName: 'rbac_standard_roles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'rbac_role_permissions',
      new TableForeignKey({
        columnNames: ['permissionId'],
        referencedTableName: 'rbac_permissions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Create indices for performance
    await queryRunner.createIndex(
      'rbac_standard_roles',
      new TableIndex({
        name: 'IDX_RBAC_ROLES_CODE',
        columnNames: ['roleCode'],
      }),
    );

    await queryRunner.createIndex(
      'rbac_standard_roles',
      new TableIndex({
        name: 'IDX_RBAC_ROLES_CATEGORY',
        columnNames: ['roleCategory'],
      }),
    );

    await queryRunner.createIndex(
      'rbac_permissions',
      new TableIndex({
        name: 'IDX_RBAC_PERMISSIONS_MODULE',
        columnNames: ['module', 'subModule'],
      }),
    );

    await queryRunner.createIndex(
      'rbac_role_permissions',
      new TableIndex({
        name: 'IDX_RBAC_ROLE_PERMISSIONS_UNIQUE',
        columnNames: ['roleId', 'permissionId'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('rbac_role_permissions');
    await queryRunner.dropTable('rbac_permissions');
    await queryRunner.dropTable('rbac_standard_roles');
  }
}
