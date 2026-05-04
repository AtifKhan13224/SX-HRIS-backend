/**
 * Migration: Create Custom RBAC Tables
 * 
 * This migration creates the complete database schema for the Advanced Custom Permission Roles module.
 * It supports:
 * - Custom role definitions
 * - Role composition and inheritance
 * - Ultra fine-grained permissions
 * - Context-aware data scopes
 * - Field-level security
 * - Conditional access rules
 * - Segregation of duties
 * - Approval workflows
 * - Versioning and rollback
 * - Risk scoring
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // ===================================================================
      // 1. CUSTOM ROLES TABLE
      // ===================================================================
      await queryInterface.createTable('custom_roles', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        tenant_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'tenants',
            key: 'id'
          }
        },
        role_code: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        role_name: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        
        // Classification
        category: {
          type: Sequelize.ENUM(
            'OPERATIONAL',
            'MANAGERIAL',
            'HR',
            'FINANCE',
            'IT',
            'AUDIT',
            'EXECUTIVE',
            'CUSTOM'
          ),
          allowNull: false
        },
        sensitivity_level: {
          type: Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
          allowNull: false,
          defaultValue: 'LOW'
        },
        business_criticality: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        
        // Lifecycle
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        effective_start_date: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        effective_end_date: {
          type: Sequelize.DATE,
          allowNull: true
        },
        
        // Governance
        requires_approval: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        approval_workflow_id: {
          type: Sequelize.UUID,
          allowNull: true
        },
        risk_score: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          validate: {
            min: 0,
            max: 100
          }
        },
        
        // Metadata
        tags: {
          type: Sequelize.JSONB,
          defaultValue: []
        },
        owner_id: {
          type: Sequelize.UUID,
          allowNull: false
        },
        
        created_by: {
          type: Sequelize.UUID,
          allowNull: false
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        modified_by: {
          type: Sequelize.UUID,
          allowNull: true
        },
        modified_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        version: {
          type: Sequelize.INTEGER,
          defaultValue: 1
        }
      }, { transaction });
      
      // Unique constraint on role_code per tenant
      await queryInterface.addIndex('custom_roles', ['tenant_id', 'role_code'], {
        unique: true,
        name: 'custom_roles_tenant_code_unique',
        transaction
      });
      
      await queryInterface.addIndex('custom_roles', ['tenant_id', 'category'], {
        name: 'custom_roles_tenant_category_idx',
        transaction
      });
      
      await queryInterface.addIndex('custom_roles', ['tenant_id', 'is_active'], {
        name: 'custom_roles_tenant_active_idx',
        transaction
      });
      
      // ===================================================================
      // 2. ROLE COMPOSITION & INHERITANCE
      // ===================================================================
      await queryInterface.createTable('role_compositions', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        role_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'custom_roles',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        parent_role_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'custom_roles',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        composition_type: {
          type: Sequelize.ENUM('INHERITS_FROM', 'COMPOSED_OF', 'EXTENDS'),
          allowNull: false
        },
        inheritance_strategy: {
          type: Sequelize.ENUM('FULL', 'SELECTIVE', 'ADDITIVE', 'RESTRICTIVE'),
          allowNull: false,
          defaultValue: 'FULL'
        },
        override_rules: {
          type: Sequelize.JSONB,
          defaultValue: []
        },
        priority: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        }
      }, { transaction });
      
      await queryInterface.addIndex('role_compositions', ['role_id'], {
        name: 'role_compositions_role_idx',
        transaction
      });
      
      await queryInterface.addIndex('role_compositions', ['parent_role_id'], {
        name: 'role_compositions_parent_idx',
        transaction
      });
      
      // ===================================================================
      // 3. PERMISSIONS TABLE
      // ===================================================================
      await queryInterface.createTable('permissions', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        tenant_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'tenants',
            key: 'id'
          }
        },
        
        // Permission Hierarchy
        module: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        sub_module: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        feature: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        
        // Actions
        actions: {
          type: Sequelize.JSONB,
          allowNull: false,
          defaultValue: []
        },
        
        // Security
        data_type: {
          type: Sequelize.ENUM(
            'STANDARD',
            'PII',
            'FINANCIAL',
            'SENSITIVE',
            'CONFIDENTIAL',
            'RESTRICTED'
          ),
          allowNull: false,
          defaultValue: 'STANDARD'
        },
        sensitivity_tags: {
          type: Sequelize.JSONB,
          defaultValue: []
        },
        
        // Metadata
        display_name: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        risk_level: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          validate: {
            min: 0,
            max: 100
          }
        },
        
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: true
        }
      }, { transaction });
      
      await queryInterface.addIndex('permissions', ['tenant_id', 'module', 'feature'], {
        name: 'permissions_tenant_module_feature_idx',
        transaction
      });
      
      await queryInterface.addIndex('permissions', ['tenant_id', 'is_active'], {
        name: 'permissions_tenant_active_idx',
        transaction
      });
      
      // ===================================================================
      // 4. ROLE PERMISSIONS MAPPING
      // ===================================================================
      await queryInterface.createTable('role_permissions', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        role_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'custom_roles',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        permission_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'permissions',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        
        // Context & Scope
        data_scope: {
          type: Sequelize.JSONB,
          allowNull: true
        },
        conditional_rules: {
          type: Sequelize.JSONB,
          defaultValue: []
        },
        
        // Field-Level Security
        field_access_rules: {
          type: Sequelize.JSONB,
          defaultValue: []
        },
        
        // Temporal
        effective_start_date: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        effective_end_date: {
          type: Sequelize.DATE,
          allowNull: true
        },
        time_bound_access: {
          type: Sequelize.JSONB,
          allowNull: true
        },
        
        // Governance
        justification: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        approved_by: {
          type: Sequelize.UUID,
          allowNull: true
        },
        approved_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: true
        }
      }, { transaction });
      
      await queryInterface.addIndex('role_permissions', ['role_id'], {
        name: 'role_permissions_role_idx',
        transaction
      });
      
      await queryInterface.addIndex('role_permissions', ['permission_id'], {
        name: 'role_permissions_permission_idx',
        transaction
      });
      
      await queryInterface.addIndex('role_permissions', ['role_id', 'permission_id'], {
        unique: true,
        name: 'role_permissions_role_permission_unique',
        transaction
      });
      
      // ===================================================================
      // 5. SEGREGATION OF DUTIES POLICIES
      // ===================================================================
      await queryInterface.createTable('sod_policies', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        tenant_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'tenants',
            key: 'id'
          }
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        
        // Conflict Definition
        conflict_type: {
          type: Sequelize.ENUM(
            'PERMISSION_CONFLICT',
            'ROLE_CONFLICT',
            'CROSS_MODULE',
            'APPROVAL_CHAIN'
          ),
          allowNull: false
        },
        forbidden_combinations: {
          type: Sequelize.JSONB,
          allowNull: false
        },
        
        // Severity & Enforcement
        risk_severity: {
          type: Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
          allowNull: false
        },
        enforcement_level: {
          type: Sequelize.ENUM('WARNING', 'SOFT_BLOCK', 'HARD_BLOCK'),
          allowNull: false,
          defaultValue: 'WARNING'
        },
        
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: true
        }
      }, { transaction });
      
      await queryInterface.addIndex('sod_policies', ['tenant_id', 'is_active'], {
        name: 'sod_policies_tenant_active_idx',
        transaction
      });
      
      // ===================================================================
      // 6. APPROVAL WORKFLOWS
      // ===================================================================
      await queryInterface.createTable('role_approval_workflows', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        tenant_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'tenants',
            key: 'id'
          }
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        
        // Approval Stages
        stages: {
          type: Sequelize.JSONB,
          allowNull: false
        },
        
        // Triggers
        triggers: {
          type: Sequelize.JSONB,
          defaultValue: []
        },
        
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: true
        }
      }, { transaction });
      
      await queryInterface.addIndex('role_approval_workflows', ['tenant_id'], {
        name: 'approval_workflows_tenant_idx',
        transaction
      });
      
      // ===================================================================
      // 7. ROLE CHANGE REQUESTS
      // ===================================================================
      await queryInterface.createTable('role_change_requests', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        role_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'custom_roles',
            key: 'id'
          }
        },
        request_type: {
          type: Sequelize.ENUM('CREATE', 'MODIFY', 'DELETE', 'ACTIVATE', 'DEACTIVATE'),
          allowNull: false
        },
        requested_by: {
          type: Sequelize.UUID,
          allowNull: false
        },
        requested_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        
        // Change Details
        change_snapshot: {
          type: Sequelize.JSONB,
          allowNull: false
        },
        justification: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        business_reason: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        impact_assessment: {
          type: Sequelize.JSONB,
          allowNull: true
        },
        
        // Approval Status
        status: {
          type: Sequelize.ENUM('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED'),
          allowNull: false,
          defaultValue: 'PENDING'
        },
        current_stage: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        approval_history: {
          type: Sequelize.JSONB,
          defaultValue: []
        },
        
        // Risk Assessment
        risk_score: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        sod_violations: {
          type: Sequelize.JSONB,
          defaultValue: []
        },
        security_review: {
          type: Sequelize.JSONB,
          allowNull: true
        },
        
        completed_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: true
        }
      }, { transaction });
      
      await queryInterface.addIndex('role_change_requests', ['role_id'], {
        name: 'role_change_requests_role_idx',
        transaction
      });
      
      await queryInterface.addIndex('role_change_requests', ['status'], {
        name: 'role_change_requests_status_idx',
        transaction
      });
      
      await queryInterface.addIndex('role_change_requests', ['requested_by'], {
        name: 'role_change_requests_requester_idx',
        transaction
      });
      
      // ===================================================================
      // 8. ROLE VERSIONS
      // ===================================================================
      await queryInterface.createTable('role_versions', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        role_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'custom_roles',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        version: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        
        // Snapshot
        role_snapshot: {
          type: Sequelize.JSONB,
          allowNull: false
        },
        permissions_snapshot: {
          type: Sequelize.JSONB,
          allowNull: false
        },
        composition_snapshot: {
          type: Sequelize.JSONB,
          defaultValue: []
        },
        
        // Change Tracking
        change_type: {
          type: Sequelize.ENUM('CREATE', 'UPDATE', 'DELETE'),
          allowNull: false
        },
        changed_by: {
          type: Sequelize.UUID,
          allowNull: false
        },
        changed_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        change_reason: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        
        // Impact
        affected_user_count: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        simulation_results: {
          type: Sequelize.JSONB,
          allowNull: true
        }
      }, { transaction });
      
      await queryInterface.addIndex('role_versions', ['role_id', 'version'], {
        unique: true,
        name: 'role_versions_role_version_unique',
        transaction
      });
      
      await queryInterface.addIndex('role_versions', ['role_id'], {
        name: 'role_versions_role_idx',
        transaction
      });
      
      // ===================================================================
      // 9. API ACCESS PERMISSIONS
      // ===================================================================
      await queryInterface.createTable('api_access_permissions', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        role_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'custom_roles',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        
        // API Identification
        api_endpoint: {
          type: Sequelize.STRING(500),
          allowNull: false
        },
        http_methods: {
          type: Sequelize.JSONB,
          allowNull: false
        },
        api_category: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        
        // Access Control
        access_type: {
          type: Sequelize.ENUM('READ_ONLY', 'READ_WRITE', 'FULL_ACCESS', 'WEBHOOK'),
          allowNull: false
        },
        rate_limit_tier: {
          type: Sequelize.STRING(50),
          allowNull: true
        },
        
        // Token & Scope
        token_scope: {
          type: Sequelize.JSONB,
          defaultValue: []
        },
        
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: true
        }
      }, { transaction });
      
      await queryInterface.addIndex('api_access_permissions', ['role_id'], {
        name: 'api_access_permissions_role_idx',
        transaction
      });
      
      // ===================================================================
      // 10. EFFECTIVE PERMISSIONS CACHE (Performance Optimization)
      // ===================================================================
      await queryInterface.createTable('effective_permissions_cache', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        role_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'custom_roles',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        
        // Cached Data
        resolved_permissions: {
          type: Sequelize.JSONB,
          allowNull: false
        },
        inheritance_tree: {
          type: Sequelize.JSONB,
          allowNull: true
        },
        
        // Cache Metadata
        computed_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        expires_at: {
          type: Sequelize.DATE,
          allowNull: false
        },
        cache_version: {
          type: Sequelize.INTEGER,
          defaultValue: 1
        }
      }, { transaction });
      
      await queryInterface.addIndex('effective_permissions_cache', ['role_id'], {
        unique: true,
        name: 'effective_permissions_cache_role_unique',
        transaction
      });
      
      await queryInterface.addIndex('effective_permissions_cache', ['expires_at'], {
        name: 'effective_permissions_cache_expiry_idx',
        transaction
      });
      
      await transaction.commit();
      console.log('✅ Custom RBAC tables created successfully');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error creating Custom RBAC tables:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Drop tables in reverse order
      await queryInterface.dropTable('effective_permissions_cache', { transaction });
      await queryInterface.dropTable('api_access_permissions', { transaction });
      await queryInterface.dropTable('role_versions', { transaction });
      await queryInterface.dropTable('role_change_requests', { transaction });
      await queryInterface.dropTable('role_approval_workflows', { transaction });
      await queryInterface.dropTable('sod_policies', { transaction });
      await queryInterface.dropTable('role_permissions', { transaction });
      await queryInterface.dropTable('permissions', { transaction });
      await queryInterface.dropTable('role_compositions', { transaction });
      await queryInterface.dropTable('custom_roles', { transaction });
      
      await transaction.commit();
      console.log('✅ Custom RBAC tables dropped successfully');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error dropping Custom RBAC tables:', error);
      throw error;
    }
  }
};
