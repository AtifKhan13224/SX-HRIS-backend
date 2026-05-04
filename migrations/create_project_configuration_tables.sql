-- =====================================================
-- PROJECT CONFIGURATION FRAMEWORK - DATABASE SCHEMA
-- =====================================================
-- Enterprise-grade project structure configuration
-- Defines project types, categories, lifecycles, governance
-- Created: 2024-03-09
-- Version: 1.0
-- Multi-tenant: Yes
-- Production-ready: Yes
-- =====================================================

-- ENUMS
-- =====================================================

-- Project Type Category Enum
CREATE TYPE project_type_category AS ENUM (
  'CLIENT_DELIVERY',
  'INTERNAL_INITIATIVE',
  'RESEARCH_DEVELOPMENT',
  'IMPLEMENTATION',
  'SUPPORT',
  'CONSULTING',
  'TRANSFORMATION',
  'INNOVATION',
  'COMPLIANCE',
  'MAINTENANCE'
);

-- Billing Model Enum
CREATE TYPE project_billing_model AS ENUM (
  'TIME_AND_MATERIAL',
  'FIXED_PRICE',
  'MILESTONE_BASED',
  'RETAINER',
  'NON_BILLABLE',
  'COST_PLUS',
  'UNIT_PRICE',
  'HYBRID'
);

-- Budget Control Mode Enum
CREATE TYPE project_budget_control_mode AS ENUM (
  'STRICT',
  'ADVISORY',
  'DISABLED',
  'SOFT_LIMIT',
  'HARD_LIMIT'
);

-- Staffing Requirement Enum
CREATE TYPE project_staffing_requirement AS ENUM (
  'MANDATORY',
  'OPTIONAL',
  'CONDITIONAL',
  'NOT_REQUIRED'
);

-- Lifecycle Stage Type Enum
CREATE TYPE project_lifecycle_stage_type AS ENUM (
  'INITIATION',
  'PLANNING',
  'EXECUTION',
  'MONITORING',
  'CONTROL',
  'CLOSURE',
  'CUSTOM'
);

-- Governance Enforcement Level Enum
CREATE TYPE governance_enforcement_level AS ENUM (
  'SOFT',
  'HARD',
  'INFORMATIONAL',
  'BLOCKING'
);

-- Resource Allocation Model Enum
CREATE TYPE resource_allocation_model AS ENUM (
  'ROLE_BASED',
  'RESOURCE_POOL',
  'SKILL_BASED',
  'NAMED_RESOURCE',
  'HYBRID'
);

-- Revenue Recognition Method Enum
CREATE TYPE revenue_recognition_method AS ENUM (
  'PERCENTAGE_COMPLETION',
  'MILESTONE_BASED',
  'COMPLETED_CONTRACT',
  'TIME_BASED',
  'COST_TO_COST'
);

-- =====================================================
-- TABLE 1: PROJECT TYPES
-- =====================================================
-- Defines project type classifications and default behaviors
-- Controls how projects are created and managed

CREATE TABLE project_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  
  -- Identification
  project_type_code VARCHAR(50) NOT NULL,
  project_type_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Category & Classification
  default_project_category project_type_category NOT NULL,
  parent_type_id UUID REFERENCES project_types(id) ON DELETE SET NULL,
  hierarchy_path TEXT,
  hierarchy_level INT DEFAULT 0,
  display_order INT DEFAULT 0,
  
  -- Default Billing Configuration
  default_billing_model project_billing_model DEFAULT 'TIME_AND_MATERIAL',
  default_currency VARCHAR(3) DEFAULT 'USD',
  
  -- Default Budget Configuration
  default_budget_control_mode project_budget_control_mode DEFAULT 'ADVISORY',
  requires_budget_approval BOOLEAN DEFAULT false,
  budget_approval_threshold DECIMAL(15,2),
  
  -- Time Tracking Configuration
  requires_time_tracking BOOLEAN DEFAULT true,
  time_tracking_granularity VARCHAR(50) DEFAULT 'DAILY', -- HOURLY, DAILY, WEEKLY
  allows_overtime_tracking BOOLEAN DEFAULT true,
  
  -- Staffing Configuration
  default_staffing_requirement project_staffing_requirement DEFAULT 'MANDATORY',
  requires_resource_allocation BOOLEAN DEFAULT true,
  allows_external_resources BOOLEAN DEFAULT true,
  min_team_size INT,
  max_team_size INT,
  
  -- Operational Flags
  is_billable BOOLEAN DEFAULT true,
  is_capitalized BOOLEAN DEFAULT false,
  requires_client_assignment BOOLEAN DEFAULT false,
  requires_contract_reference BOOLEAN DEFAULT false,
  allows_subprojects BOOLEAN DEFAULT true,
  max_subproject_depth INT DEFAULT 3,
  
  -- Workflow & Approval
  requires_approval_workflow BOOLEAN DEFAULT false,
  approval_workflow_template_id UUID,
  requires_executive_sponsor BOOLEAN DEFAULT false,
  requires_project_manager BOOLEAN DEFAULT true,
  
  -- Risk & Compliance
  requires_risk_assessment BOOLEAN DEFAULT false,
  requires_compliance_check BOOLEAN DEFAULT false,
  regulatory_framework VARCHAR(100),
  
  -- Integration Flags
  enables_timesheets BOOLEAN DEFAULT true,
  enables_expenses BOOLEAN DEFAULT true,
  enables_invoicing BOOLEAN DEFAULT true,
  enables_purchase_orders BOOLEAN DEFAULT false,
  enables_resource_planning BOOLEAN DEFAULT true,
  
  -- Default References
  default_lifecycle_template_id UUID,
  default_structure_template_id UUID,
  default_governance_rule_set_id UUID,
  
  -- Scope & Organizational Mapping
  scope_type VARCHAR(50), -- Reuse activity_scope_type
  scope_entity_id UUID,
  department_id UUID,
  business_unit_id UUID,
  
  -- Versioning & Governance
  version INT DEFAULT 1,
  effective_start_date DATE NOT NULL,
  effective_end_date DATE,
  status VARCHAR(50) DEFAULT 'DRAFT', -- Reuse activity_status
  
  -- Custom Extensibility
  custom_attributes JSONB,
  tags JSONB,
  
  -- Metadata
  configuration_source VARCHAR(100),
  external_reference_id VARCHAR(255),
  
  -- Approval
  approved_by UUID,
  approved_at TIMESTAMP,
  approval_notes TEXT,
  
  -- Audit Fields
  created_by UUID NOT NULL,
  updated_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Soft Delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,
  deleted_by UUID,
  
  -- Constraints
  CONSTRAINT unique_tenant_project_type_code UNIQUE (tenant_id, project_type_code),
  CONSTRAINT unique_tenant_project_type_version UNIQUE (tenant_id, project_type_code, version),
  CONSTRAINT check_hierarchy_level CHECK (hierarchy_level >= 0),
  CONSTRAINT check_team_size CHECK (min_team_size IS NULL OR max_team_size IS NULL OR min_team_size <= max_team_size)
);

-- Indexes for project_types
CREATE INDEX idx_project_types_tenant ON project_types(tenant_id);
CREATE INDEX idx_project_types_tenant_status ON project_types(tenant_id, status);
CREATE INDEX idx_project_types_code ON project_types(project_type_code);
CREATE INDEX idx_project_types_category ON project_types(default_project_category);
CREATE INDEX idx_project_types_parent ON project_types(parent_type_id);
CREATE INDEX idx_project_types_hierarchy ON project_types(hierarchy_path);
CREATE INDEX idx_project_types_effective_dates ON project_types(effective_start_date, effective_end_date);
CREATE INDEX idx_project_types_deleted ON project_types(is_deleted);

-- Trigger for auto-update timestamp
CREATE TRIGGER update_project_types_updated_at
  BEFORE UPDATE ON project_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE 2: PROJECT CATEGORIES
-- =====================================================
-- Hierarchical classification for projects

CREATE TABLE project_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  
  -- Identification
  category_code VARCHAR(50) NOT NULL,
  category_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Hierarchy
  parent_category_id UUID REFERENCES project_categories(id) ON DELETE SET NULL,
  hierarchy_path TEXT,
  hierarchy_level INT DEFAULT 0,
  display_order INT DEFAULT 0,
  
  -- Classification
  category_type VARCHAR(50), -- STRATEGIC, OPERATIONAL, TRANSFORMATION, etc.
  business_domain VARCHAR(100),
  
  -- Governance
  requires_executive_approval BOOLEAN DEFAULT false,
  reporting_frequency VARCHAR(50), -- WEEKLY, MONTHLY, QUARTERLY
  
  -- Versioning
  version INT DEFAULT 1,
  effective_start_date DATE NOT NULL,
  effective_end_date DATE,
  status VARCHAR(50) DEFAULT 'DRAFT',
  
  -- Custom
  custom_attributes JSONB,
  tags JSONB,
  
  -- Audit
  created_by UUID NOT NULL,
  updated_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Soft Delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,
  deleted_by UUID,
  
  CONSTRAINT unique_tenant_category_code UNIQUE (tenant_id, category_code),
  CONSTRAINT check_category_hierarchy_level CHECK (hierarchy_level >= 0)
);

CREATE INDEX idx_project_categories_tenant ON project_categories(tenant_id);
CREATE INDEX idx_project_categories_code ON project_categories(category_code);
CREATE INDEX idx_project_categories_parent ON project_categories(parent_category_id);
CREATE INDEX idx_project_categories_hierarchy ON project_categories(hierarchy_path);

CREATE TRIGGER update_project_categories_updated_at
  BEFORE UPDATE ON project_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE 3: PROJECT LIFECYCLE TEMPLATES
-- =====================================================
-- Defines lifecycle stage sequences for different project types

CREATE TABLE project_lifecycle_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  
  -- Identification
  template_code VARCHAR(50) NOT NULL,
  template_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Configuration
  total_stages INT NOT NULL DEFAULT 5,
  is_default_template BOOLEAN DEFAULT false,
  allows_stage_skip BOOLEAN DEFAULT false,
  allows_stage_repeat BOOLEAN DEFAULT false,
  requires_sequential_progression BOOLEAN DEFAULT true,
  
  -- Governance
  requires_gate_reviews BOOLEAN DEFAULT false,
  mandatory_stage_count INT DEFAULT 0,
  
  -- Versioning
  version INT DEFAULT 1,
  effective_start_date DATE NOT NULL,
  effective_end_date DATE,
  status VARCHAR(50) DEFAULT 'DRAFT',
  
  -- Custom
  custom_attributes JSONB,
  tags JSONB,
  
  -- Audit
  created_by UUID NOT NULL,
  updated_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Soft Delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,
  deleted_by UUID,
  
  CONSTRAINT unique_tenant_lifecycle_template_code UNIQUE (tenant_id, template_code)
);

CREATE INDEX idx_lifecycle_templates_tenant ON project_lifecycle_templates(tenant_id);
CREATE INDEX idx_lifecycle_templates_code ON project_lifecycle_templates(template_code);

CREATE TRIGGER update_lifecycle_templates_updated_at
  BEFORE UPDATE ON project_lifecycle_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE 4: PROJECT LIFECYCLE STAGES
-- =====================================================
-- Stages within lifecycle templates

CREATE TABLE project_lifecycle_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  
  -- Template Reference
  lifecycle_template_id UUID NOT NULL REFERENCES project_lifecycle_templates(id) ON DELETE CASCADE,
  
  -- Identification
  stage_code VARCHAR(50) NOT NULL,
  stage_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Stage Configuration
  stage_type project_lifecycle_stage_type NOT NULL,
  stage_order INT NOT NULL,
  is_mandatory BOOLEAN DEFAULT true,
  
  -- Entry/Exit Conditions
  entry_conditions TEXT,
  exit_conditions TEXT,
  required_deliverables TEXT[],
  
  -- Approval Configuration
  requires_approval BOOLEAN DEFAULT false,
  approval_roles TEXT[], -- Role codes that can approve
  approval_threshold INT DEFAULT 1, -- Number of approvals needed
  
  -- Duration Estimates
  estimated_duration_days INT,
  min_duration_days INT,
  max_duration_days INT,
  
  -- Allowed Actions
  allowed_role_actions JSONB, -- {"PM": ["UPDATE", "APPROVE"], "TEAM": ["VIEW"]}
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Audit
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_template_stage_code UNIQUE (lifecycle_template_id, stage_code),
  CONSTRAINT unique_template_stage_order UNIQUE (lifecycle_template_id, stage_order)
);

CREATE INDEX idx_lifecycle_stages_tenant ON project_lifecycle_stages(tenant_id);
CREATE INDEX idx_lifecycle_stages_template ON project_lifecycle_stages(lifecycle_template_id);
CREATE INDEX idx_lifecycle_stages_order ON project_lifecycle_stages(stage_order);

CREATE TRIGGER update_lifecycle_stages_updated_at
  BEFORE UPDATE ON project_lifecycle_stages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE 5: PROJECT GOVERNANCE RULES
-- =====================================================
-- Governance policies that can be applied to project types

CREATE TABLE project_governance_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  
  -- Identification
  rule_code VARCHAR(50) NOT NULL,
  rule_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Rule Configuration
  rule_category VARCHAR(100), -- BUDGET, APPROVAL, RISK, COMPLIANCE, etc.
  enforcement_level governance_enforcement_level DEFAULT 'SOFT',
  
  -- Conditions
  applies_when_condition TEXT, -- SQL-like condition
  validation_logic TEXT,
  
  -- Workflow
  requires_approval_workflow BOOLEAN DEFAULT false,
  approval_workflow_template_id UUID,
  escalation_path TEXT[],
  
  -- Thresholds
  threshold_value DECIMAL(15,2),
  threshold_unit VARCHAR(50),
  
  -- Actions
  on_violation_action VARCHAR(100), -- BLOCK, NOTIFY, ESCALATE, LOG
  notification_recipients TEXT[],
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  version INT DEFAULT 1,
  effective_start_date DATE NOT NULL,
  effective_end_date DATE,
  
  -- Custom
  custom_attributes JSONB,
  
  -- Audit
  created_by UUID NOT NULL,
  updated_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Soft Delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,
  deleted_by UUID,
  
  CONSTRAINT unique_tenant_governance_rule_code UNIQUE (tenant_id, rule_code)
);

CREATE INDEX idx_governance_rules_tenant ON project_governance_rules(tenant_id);
CREATE INDEX idx_governance_rules_code ON project_governance_rules(rule_code);
CREATE INDEX idx_governance_rules_category ON project_governance_rules(rule_category);

CREATE TRIGGER update_governance_rules_updated_at
  BEFORE UPDATE ON project_governance_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE 6: PROJECT GOVERNANCE RULE MAPPINGS
-- =====================================================
-- Links governance rules to project types

CREATE TABLE project_governance_rule_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  
  -- References
  project_type_id UUID NOT NULL REFERENCES project_types(id) ON DELETE CASCADE,
  governance_rule_id UUID NOT NULL REFERENCES project_governance_rules(id) ON DELETE CASCADE,
  
  -- Configuration
  is_mandatory BOOLEAN DEFAULT true,
  override_allowed BOOLEAN DEFAULT false,
  custom_threshold DECIMAL(15,2),
  
  -- Effective Dating
  effective_start_date DATE NOT NULL,
  effective_end_date DATE,
  
  -- Audit
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_type_rule_mapping UNIQUE (project_type_id, governance_rule_id)
);

CREATE INDEX idx_rule_mappings_tenant ON project_governance_rule_mappings(tenant_id);
CREATE INDEX idx_rule_mappings_type ON project_governance_rule_mappings(project_type_id);
CREATE INDEX idx_rule_mappings_rule ON project_governance_rule_mappings(governance_rule_id);

-- =====================================================
-- TABLE 7: PROJECT STRUCTURE TEMPLATES
-- =====================================================
-- Defines hierarchical structure blueprint for projects

CREATE TABLE project_structure_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  
  -- Identification
  template_code VARCHAR(50) NOT NULL,
  template_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Structure Configuration
  max_hierarchy_depth INT DEFAULT 5,
  supports_phases BOOLEAN DEFAULT true,
  supports_milestones BOOLEAN DEFAULT true,
  supports_tasks BOOLEAN DEFAULT true,
  supports_subtasks BOOLEAN DEFAULT true,
  
  -- Level Requirements
  mandatory_levels TEXT[], -- ['PROJECT', 'PHASE', 'TASK']
  optional_levels TEXT[],
  
  -- Dependency Rules
  allows_cross_phase_dependencies BOOLEAN DEFAULT false,
  allows_circular_dependencies BOOLEAN DEFAULT false,
  
  -- Planning
  requires_wbs_codes BOOLEAN DEFAULT true,
  wbs_code_format VARCHAR(100), -- Format template: {PROJ}-{PHASE}-{TASK}
  
  -- Status
  is_default_template BOOLEAN DEFAULT false,
  version INT DEFAULT 1,
  effective_start_date DATE NOT NULL,
  effective_end_date DATE,
  status VARCHAR(50) DEFAULT 'DRAFT',
  
  -- Custom
  custom_attributes JSONB,
  
  -- Audit
  created_by UUID NOT NULL,
  updated_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Soft Delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,
  deleted_by UUID,
  
  CONSTRAINT unique_tenant_structure_template_code UNIQUE (tenant_id, template_code)
);

CREATE INDEX idx_structure_templates_tenant ON project_structure_templates(tenant_id);
CREATE INDEX idx_structure_templates_code ON project_structure_templates(template_code);

CREATE TRIGGER update_structure_templates_updated_at
  BEFORE UPDATE ON project_structure_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE 8: PROJECT STRUCTURE LEVELS
-- =====================================================
-- Defines levels within structure templates

CREATE TABLE project_structure_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  
  -- Template Reference
  structure_template_id UUID NOT NULL REFERENCES project_structure_templates(id) ON DELETE CASCADE,
  
  -- Level Configuration
  level_code VARCHAR(50) NOT NULL,
  level_name VARCHAR(255) NOT NULL,
  level_order INT NOT NULL,
  level_depth INT NOT NULL,
  
  -- Requirements
  is_mandatory BOOLEAN DEFAULT true,
  parent_level_code VARCHAR(50),
  
  -- Constraints
  min_items INT,
  max_items INT,
  
  -- Attributes
  allows_activities BOOLEAN DEFAULT true,
  allows_resources BOOLEAN DEFAULT true,
  allows_budget BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Audit
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_template_level_code UNIQUE (structure_template_id, level_code),
  CONSTRAINT unique_template_level_order UNIQUE (structure_template_id, level_order)
);

CREATE INDEX idx_structure_levels_tenant ON project_structure_levels(tenant_id);
CREATE INDEX idx_structure_levels_template ON project_structure_levels(structure_template_id);

-- =====================================================
-- TABLE 9: PROJECT RESOURCE ALLOCATION SETTINGS
-- =====================================================
-- Resource allocation configuration per project type

CREATE TABLE project_resource_allocation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  
  -- Project Type Reference
  project_type_id UUID NOT NULL REFERENCES project_types(id) ON DELETE CASCADE,
  
  -- Allocation Model
  allocation_model resource_allocation_model DEFAULT 'ROLE_BASED',
  
  -- Requirements
  min_resource_count INT DEFAULT 1,
  max_resource_count INT,
  requires_named_resources BOOLEAN DEFAULT false,
  
  -- Resource Pool
  default_resource_pool_id UUID,
  allows_cross_pool_allocation BOOLEAN DEFAULT true,
  
  -- External Resources
  allows_external_resources BOOLEAN DEFAULT true,
  max_external_resource_percentage DECIMAL(5,2),
  requires_external_approval BOOLEAN DEFAULT true,
  
  -- Skill Requirements
  requires_skill_matching BOOLEAN DEFAULT false,
  min_skill_level VARCHAR(50),
  preferred_skill_tags JSONB,
  
  -- Allocation Rules
  default_allocation_percentage DECIMAL(5,2) DEFAULT 100.00,
  min_allocation_percentage DECIMAL(5,2) DEFAULT 10.00,
  max_allocation_percentage DECIMAL(5,2) DEFAULT 100.00,
  allows_overallocation BOOLEAN DEFAULT false,
  max_concurrent_projects INT DEFAULT 3,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Audit
  created_by UUID NOT NULL,
  updated_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_type_resource_settings UNIQUE (project_type_id)
);

CREATE INDEX idx_resource_settings_tenant ON project_resource_allocation_settings(tenant_id);
CREATE INDEX idx_resource_settings_type ON project_resource_allocation_settings(project_type_id);

-- =====================================================
-- TABLE 10: PROJECT BILLING COST SETTINGS
-- =====================================================
-- Billing and cost control configuration

CREATE TABLE project_billing_cost_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  
  -- Project Type Reference
  project_type_id UUID NOT NULL REFERENCES project_types(id) ON DELETE CASCADE,
  
  -- Billing Configuration
  billing_model project_billing_model DEFAULT 'TIME_AND_MATERIAL',
  billing_currency VARCHAR(3) DEFAULT 'USD',
  billing_frequency VARCHAR(50), -- WEEKLY, MONTHLY, MILESTONE
  
  -- Revenue Recognition
  revenue_recognition_method revenue_recognition_method DEFAULT 'PERCENTAGE_COMPLETION',
  revenue_recognition_trigger VARCHAR(100),
  
  -- Cost Tracking
  cost_tracking_enabled BOOLEAN DEFAULT true,
  cost_allocation_method VARCHAR(50), -- DIRECT, INDIRECT, OVERHEAD
  overhead_percentage DECIMAL(5,2),
  
  -- Margin Control
  margin_tracking_enabled BOOLEAN DEFAULT true,
  target_margin_percentage DECIMAL(5,2),
  min_margin_percentage DECIMAL(5,2),
  
  -- Budget Control
  budget_control_mode project_budget_control_mode DEFAULT 'ADVISORY',
  budget_variance_threshold DECIMAL(5,2),
  alerts_on_budget_deviation BOOLEAN DEFAULT true,
  
  -- Invoicing
  allows_progress_billing BOOLEAN DEFAULT true,
  requires_milestone_approval BOOLEAN DEFAULT false,
  invoice_payment_terms INT DEFAULT 30, -- Days
  
  -- Rate Cards
  default_rate_card_id UUID,
  allows_rate_override BOOLEAN DEFAULT false,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Audit
  created_by UUID NOT NULL,
  updated_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_type_billing_settings UNIQUE (project_type_id)
);

CREATE INDEX idx_billing_settings_tenant ON project_billing_cost_settings(tenant_id);
CREATE INDEX idx_billing_settings_type ON project_billing_cost_settings(project_type_id);

-- =====================================================
-- TABLE 11: PROJECT CONFIGURATION SCOPE MAPPINGS
-- =====================================================
-- Scope control for project configurations

CREATE TABLE project_configuration_scope_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  
  -- Configuration Reference (polymorphic)
  configuration_type VARCHAR(50) NOT NULL, -- PROJECT_TYPE, CATEGORY, LIFECYCLE, etc.
  configuration_id UUID NOT NULL,
  
  -- Scope
  scope_type VARCHAR(50) NOT NULL, -- Reuse activity_scope_type
  scope_entity_id UUID,
  scope_entity_name VARCHAR(255),
  is_primary BOOLEAN DEFAULT false,
  
  -- Effective Dating
  effective_start_date DATE NOT NULL,
  effective_end_date DATE,
  
  -- Audit
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_config_scope UNIQUE (configuration_type, configuration_id, scope_type, scope_entity_id)
);

CREATE INDEX idx_config_scope_tenant ON project_configuration_scope_mappings(tenant_id);
CREATE INDEX idx_config_scope_type ON project_configuration_scope_mappings(configuration_type, configuration_id);
CREATE INDEX idx_config_scope_entity ON project_configuration_scope_mappings(scope_type, scope_entity_id);

-- =====================================================
-- TABLE 12: PROJECT CONFIGURATION VERSIONS
-- =====================================================
-- Version history for all project configurations

CREATE TABLE project_configuration_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  
  -- Configuration Reference
  configuration_type VARCHAR(50) NOT NULL,
  configuration_id UUID NOT NULL,
  
  -- Version Details
  version_number INT NOT NULL,
  change_type VARCHAR(50) NOT NULL, -- CREATE, UPDATE, ACTIVATE, DEACTIVATE
  change_description TEXT,
  
  -- Snapshot
  configuration_snapshot JSONB NOT NULL,
  changed_fields JSONB,
  
  -- Effective Dating
  effective_from TIMESTAMP NOT NULL,
  effective_to TIMESTAMP,
  
  -- Change Tracking
  change_reason TEXT,
  changed_by UUID NOT NULL,
  
  -- Approval
  approved_by UUID,
  approved_at TIMESTAMP,
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_config_version UNIQUE (configuration_type, configuration_id, version_number)
);

CREATE INDEX idx_config_versions_tenant ON project_configuration_versions(tenant_id);
CREATE INDEX idx_config_versions_config ON project_configuration_versions(configuration_type, configuration_id);
CREATE INDEX idx_config_versions_created ON project_configuration_versions(created_at);

-- =====================================================
-- TABLE 13: PROJECT CONFIGURATION DEPENDENCIES
-- =====================================================
-- Tracks dependencies between configurations

CREATE TABLE project_configuration_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  
  -- Source Configuration
  source_config_type VARCHAR(50) NOT NULL,
  source_config_id UUID NOT NULL,
  
  -- Dependent Configuration/Entity
  dependent_entity_type VARCHAR(100) NOT NULL, -- PROJECT_ROLE, ACTIVITY, RATE_CARD, etc.
  dependent_entity_id UUID NOT NULL,
  dependent_entity_name VARCHAR(255),
  
  -- Dependency Details
  dependency_type VARCHAR(50) NOT NULL, -- REQUIRED, OPTIONAL, RECOMMENDED
  is_blocking BOOLEAN DEFAULT true,
  
  -- Metadata
  dependency_metadata JSONB,
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_config_deps_tenant ON project_configuration_dependencies(tenant_id);
CREATE INDEX idx_config_deps_source ON project_configuration_dependencies(source_config_type, source_config_id);
CREATE INDEX idx_config_deps_dependent ON project_configuration_dependencies(dependent_entity_type, dependent_entity_id);

-- =====================================================
-- TABLE 14: PROJECT CONFIGURATION AUDIT LOGS
-- =====================================================
-- Comprehensive audit trail

CREATE TABLE project_configuration_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  
  -- Configuration Reference
  configuration_type VARCHAR(50) NOT NULL,
  configuration_id UUID NOT NULL,
  configuration_code VARCHAR(50),
  
  -- Action Details
  action_type VARCHAR(50) NOT NULL,
  action_description TEXT NOT NULL,
  
  -- State Tracking
  before_state JSONB,
  after_state JSONB,
  changed_fields TEXT[],
  
  -- Actor Information
  performed_by UUID NOT NULL,
  performed_by_name VARCHAR(255) NOT NULL,
  performed_by_role VARCHAR(100),
  
  -- Context
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Change Details
  change_reason TEXT,
  approval_status VARCHAR(50),
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_config_audit_tenant ON project_configuration_audit_logs(tenant_id);
CREATE INDEX idx_config_audit_config ON project_configuration_audit_logs(configuration_type, configuration_id);
CREATE INDEX idx_config_audit_action ON project_configuration_audit_logs(action_type);
CREATE INDEX idx_config_audit_actor ON project_configuration_audit_logs(performed_by);
CREATE INDEX idx_config_audit_created ON project_configuration_audit_logs(created_at);

-- =====================================================
-- SAMPLE QUERIES
-- =====================================================

-- Get all active project types for a tenant
/*
SELECT pt.*, 
       lct.template_name as lifecycle_template,
       st.template_name as structure_template
FROM project_types pt
LEFT JOIN project_lifecycle_templates lct ON pt.default_lifecycle_template_id = lct.id
LEFT JOIN project_structure_templates st ON pt.default_structure_template_id = st.id
WHERE pt.tenant_id = 'tenant-uuid'
  AND pt.status = 'ACTIVE'
  AND pt.is_deleted = false
  AND pt.effective_start_date <= CURRENT_DATE
  AND (pt.effective_end_date IS NULL OR pt.effective_end_date >= CURRENT_DATE);
*/

-- Get project type with all governance rules
/*
SELECT pt.project_type_name,
       gr.rule_name,
       gr.enforcement_level,
       grm.is_mandatory
FROM project_types pt
JOIN project_governance_rule_mappings grm ON pt.id = grm.project_type_id
JOIN project_governance_rules gr ON grm.governance_rule_id = gr.id
WHERE pt.tenant_id = 'tenant-uuid'
  AND pt.id = 'project-type-uuid'
  AND gr.is_active = true;
*/

-- Get complete lifecycle template with stages
/*
SELECT lct.template_name,
       json_agg(
         json_build_object(
           'stage_name', ls.stage_name,
           'stage_order', ls.stage_order,
           'stage_type', ls.stage_type,
           'is_mandatory', ls.is_mandatory,
           'estimated_duration_days', ls.estimated_duration_days
         ) ORDER BY ls.stage_order
       ) as stages
FROM project_lifecycle_templates lct
JOIN project_lifecycle_stages ls ON lct.id = ls.lifecycle_template_id
WHERE lct.tenant_id = 'tenant-uuid'
  AND lct.id = 'template-uuid'
  AND ls.is_active = true
GROUP BY lct.id, lct.template_name;
*/

-- Get project type hierarchy
/*
WITH RECURSIVE type_hierarchy AS (
  SELECT id, project_type_code, project_type_name, parent_type_id, hierarchy_level, 
         ARRAY[project_type_code] as path
  FROM project_types
  WHERE parent_type_id IS NULL 
    AND tenant_id = 'tenant-uuid'
    AND is_deleted = false
  
  UNION ALL
  
  SELECT pt.id, pt.project_type_code, pt.project_type_name, pt.parent_type_id, pt.hierarchy_level,
         th.path || pt.project_type_code
  FROM project_types pt
  JOIN type_hierarchy th ON pt.parent_type_id = th.id
  WHERE pt.is_deleted = false
)
SELECT * FROM type_hierarchy ORDER BY path;
*/

-- Get dependencies for a project type
/*
SELECT pcd.dependent_entity_type,
       pcd.dependent_entity_name,
       pcd.dependency_type,
       pcd.is_blocking,
       COUNT(*) as dependency_count
FROM project_configuration_dependencies pcd
WHERE pcd.tenant_id = 'tenant-uuid'
  AND pcd.source_config_type = 'PROJECT_TYPE'
  AND pcd.source_config_id = 'project-type-uuid'
GROUP BY pcd.dependent_entity_type, pcd.dependent_entity_name, 
         pcd.dependency_type, pcd.is_blocking;
*/

-- =====================================================
-- COMMENTS & DOCUMENTATION
-- =====================================================

COMMENT ON TABLE project_types IS 'Enterprise project type definitions with default behaviors and operational flags';
COMMENT ON TABLE project_categories IS 'Hierarchical project categorization for reporting and governance';
COMMENT ON TABLE project_lifecycle_templates IS 'Lifecycle stage sequence templates for different project types';
COMMENT ON TABLE project_lifecycle_stages IS 'Individual stages within lifecycle templates';
COMMENT ON TABLE project_governance_rules IS 'Governance policies applicable to projects';
COMMENT ON TABLE project_governance_rule_mappings IS 'Links governance rules to project types';
COMMENT ON TABLE project_structure_templates IS 'Hierarchical structure blueprints for projects';
COMMENT ON TABLE project_structure_levels IS 'Levels within structure templates';
COMMENT ON TABLE project_resource_allocation_settings IS 'Resource allocation rules per project type';
COMMENT ON TABLE project_billing_cost_settings IS 'Billing and cost tracking configuration';
COMMENT ON TABLE project_configuration_scope_mappings IS 'Organizational scope control for configurations';
COMMENT ON TABLE project_configuration_versions IS 'Version history for all project configurations';
COMMENT ON TABLE project_configuration_dependencies IS 'Dependency tracking between configurations';
COMMENT ON TABLE project_configuration_audit_logs IS 'Comprehensive audit trail for compliance';

-- =====================================================
-- END OF SCHEMA
-- =====================================================
