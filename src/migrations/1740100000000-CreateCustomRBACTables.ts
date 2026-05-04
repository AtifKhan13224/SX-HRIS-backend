import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateCustomRBACTables1740100000000 implements MigrationInterface {
  name = 'CreateCustomRBACTables1740100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ====================================
    // 1. CUSTOM ROLES TABLE
    // ====================================
    await queryRunner.createTable(
      new Table({
        name: 'custom_roles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'role_code',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'role_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          // Classification
          {
            name: 'category',
            type: 'enum',
            enum: ['OPERATIONAL', 'MANAGERIAL', 'HR', 'FINANCE', 'IT', 'AUDIT', 'EXECUTIVE', 'CUSTOM'],
            isNullable: false,
          },
          {
            name: 'sensitivity_level',
            type: 'enum',
            enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
            default: "'LOW'",
          },
          {
            name: 'business_criticality',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          // Lifecycle
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'effective_start_date',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'effective_end_date',
            type: 'timestamp',
            isNullable: true,
          },
          // Governance
          {
            name: 'requires_approval',
            type: 'boolean',
            default: false,
          },
          {
            name: 'approval_workflow_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'risk_score',
            type: 'integer',
            default: 0,
          },
          // Metadata
          {
            name: 'tags',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            name: 'owner_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'modified_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'modified_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'version',
            type: 'integer',
            default: 1,
          },
        ],
      }),
      true,
    );

    // Create indexes for custom_roles
    await queryRunner.createIndex(
      'custom_roles',
      new TableIndex({
        name: 'IDX_custom_roles_tenant_role_code',
        columnNames: ['tenant_id', 'role_code'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'custom_roles',
      new TableIndex({
        name: 'IDX_custom_roles_tenant_category',
        columnNames: ['tenant_id', 'category'],
      }),
    );
    await queryRunner.createIndex(
      'custom_roles',
      new TableIndex({
        name: 'IDX_custom_roles_tenant_active',
        columnNames: ['tenant_id', 'is_active'],
      }),
    );
    await queryRunner.createIndex(
      'custom_roles',
      new TableIndex({
        name: 'IDX_custom_roles_sensitivity',
        columnNames: ['sensitivity_level'],
      }),
    );

    // ====================================
    // 2. ROLE COMPOSITIONS TABLE (Inheritance)
    // ====================================
    await queryRunner.createTable(
      new Table({
        name: 'role_compositions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'role_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'parent_role_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'composition_type',
            type: 'enum',
            enum: ['INHERITS_FROM', 'COMPOSED_OF', 'EXTENDS'],
            isNullable: false,
          },
          {
            name: 'inheritance_strategy',
            type: 'enum',
            enum: ['FULL', 'SELECTIVE', 'ADDITIVE', 'RESTRICTIVE'],
            default: "'FULL'",
          },
          {
            name: 'override_rules',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            name: 'priority',
            type: 'integer',
            default: 100,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes and foreign keys for role_compositions
    await queryRunner.createIndex(
      'role_compositions',
      new TableIndex({
        name: 'IDX_role_compositions_role_parent',
        columnNames: ['role_id', 'parent_role_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKey(
      'role_compositions',
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedTableName: 'custom_roles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'role_compositions',
      new TableForeignKey({
        columnNames: ['parent_role_id'],
        referencedTableName: 'custom_roles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // ====================================
    // 3. PERMISSIONS TABLE (Ultra Fine-Grained)
    // ====================================
    await queryRunner.createTable(
      new Table({
        name: 'permissions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          // Permission Hierarchy
          {
            name: 'module',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'sub_module',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'feature',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          // Actions
          {
            name: 'actions',
            type: 'jsonb',
            default: "'[]'",
          },
          // Security
          {
            name: 'data_type',
            type: 'enum',
            enum: ['PII', 'FINANCIAL', 'SENSITIVE', 'STANDARD'],
            default: "'STANDARD'",
          },
          {
            name: 'sensitivity_tags',
            type: 'jsonb',
            default: "'[]'",
          },
          // Metadata
          {
            name: 'display_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'risk_level',
            type: 'integer',
            default: 0,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes for permissions
    await queryRunner.createIndex(
      'permissions',
      new TableIndex({
        name: 'IDX_permissions_tenant_module',
        columnNames: ['tenant_id', 'module'],
      }),
    );
    await queryRunner.createIndex(
      'permissions',
      new TableIndex({
        name: 'IDX_permissions_data_type',
        columnNames: ['data_type'],
      }),
    );

    // ====================================
    // 4. ROLE PERMISSIONS TABLE (Contextual Mapping)
    // ====================================
    await queryRunner.createTable(
      new Table({
        name: 'role_permissions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'role_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'permission_id',
            type: 'uuid',
            isNullable: false,
          },
          // Context-Aware Access
          {
            name: 'context_conditions',
            type: 'jsonb',
            isNullable: true,
            comment: 'Lifecycle stage, notice period, acting assignment, etc.',
          },
          // Advanced Scope Rules
          {
            name: 'scope_type',
            type: 'enum',
            enum: ['STATIC', 'DYNAMIC_HIERARCHY', 'CONDITIONAL', 'CROSS_ENTITY', 'TEMPORARY'],
            default: "'STATIC'",
          },
          {
            name: 'scope_definition',
            type: 'jsonb',
            isNullable: true,
          },
          // Field & Attribute Security
          {
            name: 'field_restrictions',
            type: 'jsonb',
            isNullable: true,
            comment: 'Field-level access control (salary protection, ID masking, etc.)',
          },
          // Lifecycle
          {
            name: 'effective_start_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'effective_end_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'granted_by',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'granted_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes and foreign keys for role_permissions
    await queryRunner.createIndex(
      'role_permissions',
      new TableIndex({
        name: 'IDX_role_permissions_role_permission',
        columnNames: ['role_id', 'permission_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKey(
      'role_permissions',
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedTableName: 'custom_roles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'role_permissions',
      new TableForeignKey({
        columnNames: ['permission_id'],
        referencedTableName: 'permissions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // ====================================
    // 5. SOD POLICIES TABLE (Segregation of Duties)
    // ====================================
    await queryRunner.createTable(
      new Table({
        name: 'sod_policies',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'policy_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'conflict_type',
            type: 'enum',
            enum: ['PERMISSION_CONFLICT', 'ROLE_CONFLICT', 'CROSS_MODULE_CONFLICT', 'APPROVAL_CHAIN_CONFLICT'],
            isNullable: false,
          },
          {
            name: 'conflicting_items',
            type: 'jsonb',
            isNullable: false,
            comment: 'Array of permission IDs, role IDs, or module names',
          },
          {
            name: 'enforcement_level',
            type: 'enum',
            enum: ['WARNING', 'SOFT_BLOCK', 'HARD_BLOCK'],
            default: "'WARNING'",
          },
          {
            name: 'rationale',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes for sod_policies
    await queryRunner.createIndex(
      'sod_policies',
      new TableIndex({
        name: 'IDX_sod_policies_tenant',
        columnNames: ['tenant_id'],
      }),
    );

    // ====================================
    // 6. ROLE APPROVAL WORKFLOWS TABLE
    // ====================================
    await queryRunner.createTable(
      new Table({
        name: 'role_approval_workflows',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'workflow_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'applies_to_risk_level',
            type: 'integer',
            isNullable: true,
            comment: 'Minimum risk score to trigger this workflow',
          },
          {
            name: 'applies_to_sensitivity',
            type: 'enum',
            enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
            isNullable: true,
          },
          {
            name: 'stages',
            type: 'jsonb',
            isNullable: false,
            comment: 'Array of approval stages with approver roles/users',
          },
          {
            name: 'requires_legal_review',
            type: 'boolean',
            default: false,
          },
          {
            name: 'auto_approve_below_risk',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes for role_approval_workflows
    await queryRunner.createIndex(
      'role_approval_workflows',
      new TableIndex({
        name: 'IDX_role_approval_workflows_tenant',
        columnNames: ['tenant_id'],
      }),
    );

    // ====================================
    // 7. ROLE CHANGE REQUESTS TABLE
    // ====================================
    await queryRunner.createTable(
      new Table({
        name: 'role_change_requests',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'role_id',
            type: 'uuid',
            isNullable: true,
            comment: 'Null for new role creation',
          },
          {
            name: 'request_type',
            type: 'enum',
            enum: ['CREATE', 'UPDATE', 'DELETE', 'PERMISSION_CHANGE', 'COMPOSITION_CHANGE'],
            isNullable: false,
          },
          {
            name: 'requested_changes',
            type: 'jsonb',
            isNullable: false,
            comment: 'Full diff of requested changes',
          },
          {
            name: 'impact_analysis',
            type: 'jsonb',
            isNullable: true,
            comment: 'Simulated impact of changes',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'IMPLEMENTED'],
            default: "'PENDING'",
          },
          {
            name: 'workflow_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'current_stage',
            type: 'integer',
            default: 0,
          },
          {
            name: 'approval_history',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            name: 'justification',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'requested_by',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'requested_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'reviewed_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'reviewed_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create indexes and foreign keys for role_change_requests
    await queryRunner.createIndex(
      'role_change_requests',
      new TableIndex({
        name: 'IDX_role_change_requests_tenant_status',
        columnNames: ['tenant_id', 'status'],
      }),
    );

    await queryRunner.createForeignKey(
      'role_change_requests',
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedTableName: 'custom_roles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'role_change_requests',
      new TableForeignKey({
        columnNames: ['workflow_id'],
        referencedTableName: 'role_approval_workflows',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // ====================================
    // 8. ROLE VERSIONS TABLE (History & Rollback)
    // ====================================
    await queryRunner.createTable(
      new Table({
        name: 'role_versions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'role_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'version_number',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'snapshot',
            type: 'jsonb',
            isNullable: false,
            comment: 'Complete role configuration at this version',
          },
          {
            name: 'change_summary',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'changed_by',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'changed_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes and foreign keys for role_versions
    await queryRunner.createIndex(
      'role_versions',
      new TableIndex({
        name: 'IDX_role_versions_role_version',
        columnNames: ['role_id', 'version_number'],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKey(
      'role_versions',
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedTableName: 'custom_roles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // ====================================
    // 9. API ACCESS PERMISSIONS TABLE
    // ====================================
    await queryRunner.createTable(
      new Table({
        name: 'api_access_permissions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'role_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'api_endpoint',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'http_methods',
            type: 'jsonb',
            default: "'[]'",
            comment: 'Allowed HTTP methods: GET, POST, PUT, DELETE, PATCH',
          },
          {
            name: 'rate_limit',
            type: 'integer',
            isNullable: true,
            comment: 'Requests per minute',
          },
          {
            name: 'scope_restrictions',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes and foreign keys for api_access_permissions
    await queryRunner.createIndex(
      'api_access_permissions',
      new TableIndex({
        name: 'IDX_api_access_permissions_role',
        columnNames: ['role_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'api_access_permissions',
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedTableName: 'custom_roles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // ====================================
    // 10. EFFECTIVE PERMISSIONS CACHE TABLE
    // ====================================
    await queryRunner.createTable(
      new Table({
        name: 'effective_permissions_cache',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'role_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'effective_permissions',
            type: 'jsonb',
            isNullable: false,
            comment: 'Flattened, resolved permissions with inheritance applied',
          },
          {
            name: 'inheritance_chain',
            type: 'jsonb',
            isNullable: true,
            comment: 'Complete inheritance path',
          },
          {
            name: 'last_calculated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'is_valid',
            type: 'boolean',
            default: true,
          },
        ],
      }),
      true,
    );

    // Create indexes and foreign keys for effective_permissions_cache
    await queryRunner.createIndex(
      'effective_permissions_cache',
      new TableIndex({
        name: 'IDX_effective_permissions_cache_role',
        columnNames: ['role_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKey(
      'effective_permissions_cache',
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedTableName: 'custom_roles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // ====================================
    // 11. CONTEXT EVALUATION RULES TABLE
    // ====================================
    await queryRunner.createTable(
      new Table({
        name: 'context_evaluation_rules',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tenant_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'rule_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'context_type',
            type: 'enum',
            enum: ['LIFECYCLE_STAGE', 'NOTICE_PERIOD', 'ACTING_ASSIGNMENT', 'TEMPORARY_ELEVATION', 'TIME_BOUND', 'EMERGENCY_MODE'],
            isNullable: false,
          },
          {
            name: 'evaluation_logic',
            type: 'jsonb',
            isNullable: false,
            comment: 'IF-THEN conditions for context evaluation',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes for context_evaluation_rules
    await queryRunner.createIndex(
      'context_evaluation_rules',
      new TableIndex({
        name: 'IDX_context_evaluation_rules_tenant_type',
        columnNames: ['tenant_id', 'context_type'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order to handle foreign key constraints
    await queryRunner.dropTable('context_evaluation_rules');
    await queryRunner.dropTable('effective_permissions_cache');
    await queryRunner.dropTable('api_access_permissions');
    await queryRunner.dropTable('role_versions');
    await queryRunner.dropTable('role_change_requests');
    await queryRunner.dropTable('role_approval_workflows');
    await queryRunner.dropTable('sod_policies');
    await queryRunner.dropTable('role_permissions');
    await queryRunner.dropTable('permissions');
    await queryRunner.dropTable('role_compositions');
    await queryRunner.dropTable('custom_roles');
  }
}
