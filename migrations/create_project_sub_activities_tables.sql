-- ============================================================================
-- PROJECT SUB-ACTIVITIES CONFIGURATION - DATABASE SCHEMA
-- ============================================================================
-- Purpose: Sub-activity configuration for granular project work breakdown
-- Parent-Child: Sub-activities belong to parent Activities (project_activities)
-- Features: Multi-tenant, Scope control, Effective dating, Version control, Audit trail
-- Tables: 5 (sub_activities, scope_mappings, versions, dependency_links, audit_logs)
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Sub-Activity Work Type (new enum specific to sub-activities)
CREATE TYPE sub_activity_work_type AS ENUM (
  'HOURLY',      -- Work tracked by hours
  'DAILY',       -- Work tracked by days
  'MILESTONE'    -- Work tracked by milestones/deliverables
);

-- Duration Type for work estimation
CREATE TYPE sub_activity_duration_type AS ENUM (
  'HOURS',
  'DAYS',
  'WEEKS',
  'FIXED_BID'
);

-- Sub-Activity Status (can reuse activity_status or define specific)
-- Reusing activity_status enum: DRAFT, ACTIVE, INACTIVE, DEPRECATED, PENDING_APPROVAL

-- ============================================================================
-- MAIN TABLE: project_sub_activities
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_sub_activities (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Multi-tenant Isolation
  tenant_id UUID NOT NULL,
  
  -- Parent Relationship (CRITICAL)
  parent_activity_id UUID NOT NULL REFERENCES project_activities(id) ON DELETE CASCADE,
  
  -- Sub-Activity Identification
  sub_activity_code VARCHAR(50) NOT NULL,
  sub_activity_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Work Type Configuration (specific to sub-activities)
  work_type sub_activity_work_type NOT NULL DEFAULT 'HOURLY',
  default_duration_type sub_activity_duration_type NOT NULL DEFAULT 'HOURS',
  estimated_hours DECIMAL(10, 2),
  estimated_days DECIMAL(10, 2),
  
  -- Financial Configuration
  is_billable BOOLEAN NOT NULL DEFAULT TRUE,
  is_timesheet_required BOOLEAN NOT NULL DEFAULT TRUE,
  cost_allocation_category VARCHAR(100), -- e.g., 'DIRECT', 'INDIRECT', 'OVERHEAD'
  billing_rate_override DECIMAL(12, 2), -- Override parent activity's billing rate
  
  -- Resource and Skill Requirements
  required_skill_level VARCHAR(50), -- e.g., 'JUNIOR', 'SENIOR', 'EXPERT'
  requires_certification BOOLEAN DEFAULT FALSE,
  certification_type VARCHAR(100),
  min_resource_count INT DEFAULT 1,
  max_resource_count INT,
  
  -- Task Configuration
  is_task_template BOOLEAN DEFAULT FALSE, -- Can be used as template for recurring tasks
  allows_parallel_execution BOOLEAN DEFAULT TRUE,
  requires_sequential_completion BOOLEAN DEFAULT FALSE,
  
  -- Business Rules
  allow_overtime BOOLEAN DEFAULT FALSE,
  max_hours_per_day DECIMAL(5, 2),
  requires_manager_approval BOOLEAN DEFAULT FALSE,
  requires_client_approval BOOLEAN DEFAULT FALSE,
  
  -- Default Associations
  default_project_role_id UUID, -- Can inherit from parent or override
  default_rate_card_id UUID,
  default_approval_workflow_id UUID,
  
  -- Governance & Versioning
  version INT NOT NULL DEFAULT 1,
  effective_start_date DATE NOT NULL,
  effective_end_date DATE,
  status activity_status NOT NULL DEFAULT 'DRAFT',
  
  -- Hierarchy and Ordering
  display_order INT DEFAULT 0,
  hierarchy_level INT DEFAULT 1, -- Support for nested sub-activities if needed
  
  -- Custom Attributes (Extensibility)
  custom_attributes JSONB, -- Store additional configuration as key-value pairs
  tags JSONB, -- Array of tags for categorization
  
  -- Configuration Metadata
  configuration_source VARCHAR(100), -- 'SYSTEM', 'IMPORT', 'MANUAL'
  external_reference_id VARCHAR(255),
  
  -- Approval and Workflow
  approved_by UUID,
  approved_at TIMESTAMP,
  approval_notes TEXT,
  
  -- Audit Fields
  created_by UUID NOT NULL,
  updated_by UUID,
  deactivated_by UUID,
  deactivated_at TIMESTAMP,
  deactivation_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Soft Delete
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMP,
  deleted_by UUID,
  
  -- Constraints
  CONSTRAINT unique_tenant_subactivity_code UNIQUE (tenant_id, sub_activity_code),
  CONSTRAINT unique_tenant_subactivity_version UNIQUE (tenant_id, sub_activity_code, version)
);

-- ============================================================================
-- INDEXES for project_sub_activities
-- ============================================================================
CREATE INDEX idx_sub_activities_tenant_id ON project_sub_activities(tenant_id);
CREATE INDEX idx_sub_activities_parent_activity_id ON project_sub_activities(parent_activity_id);
CREATE INDEX idx_sub_activities_tenant_status ON project_sub_activities(tenant_id, status);
CREATE INDEX idx_sub_activities_tenant_code ON project_sub_activities(tenant_id, sub_activity_code);
CREATE INDEX idx_sub_activities_effective_dates ON project_sub_activities(tenant_id, effective_start_date, effective_end_date);
CREATE INDEX idx_sub_activities_work_type ON project_sub_activities(work_type);
CREATE INDEX idx_sub_activities_billable ON project_sub_activities(is_billable);
CREATE INDEX idx_sub_activities_is_deleted ON project_sub_activities(is_deleted);
CREATE INDEX idx_sub_activities_created_at ON project_sub_activities(created_at DESC);

-- ============================================================================
-- TABLE: sub_activity_scope_mappings
-- ============================================================================
CREATE TABLE IF NOT EXISTS sub_activity_scope_mappings (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Multi-tenant Isolation
  tenant_id UUID NOT NULL,
  
  -- Foreign Key to Sub-Activity
  sub_activity_id UUID NOT NULL REFERENCES project_sub_activities(id) ON DELETE CASCADE,
  
  -- Scope Definition (reusing activity_scope_type enum)
  scope_type activity_scope_type NOT NULL,
  scope_entity_id UUID, -- Foreign key to Legal Entity, Business Unit, etc.
  scope_entity_name VARCHAR(255), -- Denormalized for performance
  
  -- Scope Flags
  is_primary BOOLEAN DEFAULT FALSE,
  inherits_from_parent BOOLEAN DEFAULT TRUE, -- If true, uses parent activity's scope
  
  -- Effective Dating
  effective_start_date DATE NOT NULL,
  effective_end_date DATE,
  
  -- Audit Fields
  created_by UUID NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sub_activity_scopes_tenant_id ON sub_activity_scope_mappings(tenant_id);
CREATE INDEX idx_sub_activity_scopes_sub_activity_id ON sub_activity_scope_mappings(tenant_id, sub_activity_id);
CREATE INDEX idx_sub_activity_scopes_scope_type ON sub_activity_scope_mappings(scope_type, scope_entity_id);

-- ============================================================================
-- TABLE: sub_activity_versions
-- ============================================================================
CREATE TABLE IF NOT EXISTS sub_activity_versions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Multi-tenant Isolation
  tenant_id UUID NOT NULL,
  
  -- Foreign Key to Sub-Activity
  sub_activity_id UUID NOT NULL REFERENCES project_sub_activities(id) ON DELETE CASCADE,
  
  -- Version Information
  version_number INT NOT NULL,
  change_type VARCHAR(50) NOT NULL, -- CREATE, UPDATE, STATUS_CHANGE, SCOPE_CHANGE, PARENT_CHANGE
  change_description TEXT,
  
  -- Snapshot (Complete state at this version)
  configuration_snapshot JSONB NOT NULL,
  changed_fields JSONB, -- Delta of what changed
  
  -- Effective Period
  effective_from TIMESTAMP NOT NULL,
  effective_to TIMESTAMP,
  
  -- Change Metadata
  change_reason TEXT,
  changed_by UUID NOT NULL,
  
  -- Approval
  approved_by UUID,
  approved_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_sub_activity_version UNIQUE (tenant_id, sub_activity_id, version_number)
);

-- Indexes
CREATE INDEX idx_sub_activity_versions_tenant_id ON sub_activity_versions(tenant_id);
CREATE INDEX idx_sub_activity_versions_sub_activity_id ON sub_activity_versions(tenant_id, sub_activity_id, version_number);
CREATE INDEX idx_sub_activity_versions_created_at ON sub_activity_versions(created_at DESC);

-- ============================================================================
-- TABLE: sub_activity_dependency_links
-- ============================================================================
CREATE TABLE IF NOT EXISTS sub_activity_dependency_links (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Multi-tenant Isolation
  tenant_id UUID NOT NULL,
  
  -- Source Sub-Activity
  source_sub_activity_id UUID NOT NULL REFERENCES project_sub_activities(id) ON DELETE CASCADE,
  
  -- Dependent Entity Reference
  dependent_entity_type VARCHAR(100) NOT NULL, -- PROJECT, TASK, TIMESHEET, RATE_CARD, ASSIGNMENT
  dependent_entity_id UUID NOT NULL,
  dependent_entity_name VARCHAR(255),
  
  -- Dependency Configuration
  dependency_type VARCHAR(50) NOT NULL, -- REQUIRED, OPTIONAL, RECOMMENDED
  is_blocking BOOLEAN NOT NULL DEFAULT TRUE, -- Prevents deletion if true
  
  -- Parent Activity Reference (for validation)
  parent_activity_id UUID REFERENCES project_activities(id),
  
  -- Metadata
  link_metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sub_activity_deps_tenant_id ON sub_activity_dependency_links(tenant_id);
CREATE INDEX idx_sub_activity_deps_source_sub_activity ON sub_activity_dependency_links(tenant_id, source_sub_activity_id);
CREATE INDEX idx_sub_activity_deps_dependent_entity ON sub_activity_dependency_links(dependent_entity_type, dependent_entity_id);
CREATE INDEX idx_sub_activity_deps_parent_activity ON sub_activity_dependency_links(parent_activity_id);

-- ============================================================================
-- TABLE: sub_activity_audit_logs
-- ============================================================================
CREATE TABLE IF NOT EXISTS sub_activity_audit_logs (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Multi-tenant Isolation
  tenant_id UUID NOT NULL,
  
  -- Foreign Key to Sub-Activity
  sub_activity_id UUID NOT NULL REFERENCES project_sub_activities(id) ON DELETE CASCADE,
  sub_activity_code VARCHAR(50) NOT NULL,
  
  -- Parent Activity Reference (for traceability)
  parent_activity_id UUID REFERENCES project_activities(id),
  
  -- Action Information
  action_type VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, ACTIVATE, DEACTIVATE, APPROVE, PARENT_CHANGE
  action_description TEXT NOT NULL,
  
  -- State Snapshots
  before_state JSONB,
  after_state JSONB,
  changed_fields JSONB, -- Array of field names that changed
  
  -- User Context
  performed_by UUID NOT NULL,
  performed_by_name VARCHAR(255) NOT NULL,
  performed_by_role VARCHAR(100),
  
  -- Request Context
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Change Metadata
  change_reason TEXT,
  approval_status VARCHAR(50), -- PENDING, APPROVED, REJECTED
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sub_activity_audit_tenant_id ON sub_activity_audit_logs(tenant_id);
CREATE INDEX idx_sub_activity_audit_sub_activity_id ON sub_activity_audit_logs(tenant_id, sub_activity_id, created_at DESC);
CREATE INDEX idx_sub_activity_audit_parent_activity_id ON sub_activity_audit_logs(parent_activity_id);
CREATE INDEX idx_sub_activity_audit_action_type ON sub_activity_audit_logs(action_type);
CREATE INDEX idx_sub_activity_audit_performed_by ON sub_activity_audit_logs(performed_by);
CREATE INDEX idx_sub_activity_audit_created_at ON sub_activity_audit_logs(created_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp for project_sub_activities
CREATE OR REPLACE FUNCTION update_sub_activity_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sub_activity_updated_at
BEFORE UPDATE ON project_sub_activities
FOR EACH ROW
EXECUTE FUNCTION update_sub_activity_updated_at();

-- Auto-update updated_at timestamp for sub_activity_scope_mappings
CREATE TRIGGER trigger_update_sub_activity_scope_updated_at
BEFORE UPDATE ON sub_activity_scope_mappings
FOR EACH ROW
EXECUTE FUNCTION update_sub_activity_updated_at();

-- Auto-update updated_at timestamp for sub_activity_dependency_links
CREATE TRIGGER trigger_update_sub_activity_deps_updated_at
BEFORE UPDATE ON sub_activity_dependency_links
FOR EACH ROW
EXECUTE FUNCTION update_sub_activity_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE project_sub_activities IS 'Sub-activity configuration for granular project work breakdown. Child of project_activities.';
COMMENT ON COLUMN project_sub_activities.parent_activity_id IS 'Required foreign key to parent activity (project_activities.id)';
COMMENT ON COLUMN project_sub_activities.work_type IS 'How work is tracked: HOURLY, DAILY, or MILESTONE';
COMMENT ON COLUMN project_sub_activities.cost_allocation_category IS 'Cost allocation: DIRECT, INDIRECT, OVERHEAD';
COMMENT ON COLUMN project_sub_activities.billing_rate_override IS 'Override parent activity billing rate if needed';

COMMENT ON TABLE sub_activity_scope_mappings IS 'Organizational scope for sub-activities. Can inherit from parent activity.';
COMMENT ON COLUMN sub_activity_scope_mappings.inherits_from_parent IS 'If true, uses parent activity scope instead of explicit scope';

COMMENT ON TABLE sub_activity_versions IS 'Version history for sub-activity configurations';
COMMENT ON COLUMN sub_activity_versions.configuration_snapshot IS 'Complete JSONB snapshot of sub-activity state at this version';

COMMENT ON TABLE sub_activity_dependency_links IS 'Manages relationships between sub-activities and dependent entities';
COMMENT ON COLUMN sub_activity_dependency_links.parent_activity_id IS 'Reference to parent activity for validation and cascade rules';

COMMENT ON TABLE sub_activity_audit_logs IS 'Comprehensive audit trail for all sub-activity changes';
COMMENT ON COLUMN sub_activity_audit_logs.parent_activity_id IS 'Reference to parent activity for hierarchical audit queries';

-- ============================================================================
-- SAMPLE QUERIES FOR VALIDATION
-- ============================================================================

-- Query 1: Get all sub-activities for a specific parent activity
-- SELECT * FROM project_sub_activities
-- WHERE parent_activity_id = '<parent-activity-uuid>'
-- AND tenant_id = '<tenant-uuid>'
-- AND is_deleted = FALSE
-- ORDER BY display_order, sub_activity_name;

-- Query 2: Get sub-activity with parent activity details (JOIN)
-- SELECT 
--   sa.*,
--   pa.activity_code AS parent_activity_code,
--   pa.activity_name AS parent_activity_name,
--   pa.activity_category AS parent_category
-- FROM project_sub_activities sa
-- JOIN project_activities pa ON sa.parent_activity_id = pa.id
-- WHERE sa.tenant_id = '<tenant-uuid>'
-- AND sa.is_deleted = FALSE;

-- Query 3: Check if parent activity can be deleted (has active sub-activities)
-- SELECT COUNT(*) AS active_sub_activity_count
-- FROM project_sub_activities
-- WHERE parent_activity_id = '<parent-activity-uuid>'
-- AND status = 'ACTIVE'
-- AND is_deleted = FALSE;

-- Query 4: Get complete audit trail for a sub-activity including parent changes
-- SELECT * FROM sub_activity_audit_logs
-- WHERE sub_activity_id = '<sub-activity-uuid>'
-- ORDER BY created_at DESC;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
