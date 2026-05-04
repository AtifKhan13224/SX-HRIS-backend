-- ============================================================================
-- PROJECT ROLES CONFIGURATION - DATABASE SCHEMA
-- ============================================================================
-- Purpose: Enterprise-grade project role configuration with hierarchy support
-- Features: Multi-tenant, Hierarchical roles, Scope control, Version control, Audit trail
-- Tables: 6 (roles, hierarchy, scope_mappings, versions, dependency_links, audit_logs)
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Role Category (functional classification)
CREATE TYPE project_role_category AS ENUM (
  'DELIVERY',        -- Delivery-focused roles (Developer, QA)
  'MANAGEMENT',      -- Management roles (PM, Program Manager)
  'SUPPORT',         -- Support roles (Support Engineer, Help Desk)
  'CONSULTING',      -- Consulting roles (Consultant, Advisor)
  'ARCHITECTURE',    -- Architecture roles (Architect, Technical Lead)
  'ANALYSIS',        -- Analysis roles (Business Analyst, Data Analyst)
  'QUALITY',         -- Quality roles (QA Lead, Test Manager)
  'OPERATIONS',      -- Operations roles (DevOps, SRE)
  'ADMINISTRATION',  -- Administrative roles (Admin, Coordinator)
  'SPECIALIZED'      -- Specialized roles (Security Expert, Domain Expert)
);

-- Skill Level
CREATE TYPE project_role_skill_level AS ENUM (
  'ENTRY',           -- Entry level (0-1 years)
  'JUNIOR',          -- Junior (1-3 years)
  'INTERMEDIATE',    -- Intermediate (3-5 years)
  'SENIOR',          -- Senior (5-8 years)
  'EXPERT',          -- Expert (8-12 years)
  'PRINCIPAL',       -- Principal (12+ years)
  'FELLOW'           -- Fellow (15+ years, thought leader)
);

-- Resource Type
CREATE TYPE project_resource_type AS ENUM (
  'INTERNAL',        -- Internal employee
  'EXTERNAL',        -- External contractor
  'CONTRACTOR',      -- Temporary contractor
  'VENDOR',          -- Vendor resource
  'PARTNER',         -- Partner resource
  'FREELANCER'       -- Freelance resource
);

-- Default Billing Category
CREATE TYPE project_billing_category AS ENUM (
  'BILLABLE',        -- Directly billable to client
  'NON_BILLABLE',    -- Not billable (internal)
  'OVERHEAD',        -- Overhead/indirect
  'INVESTMENT',      -- Investment/R&D
  'PRESALES'         -- Pre-sales/business development
);

-- Default Cost Category
CREATE TYPE project_cost_category AS ENUM (
  'DIRECT',          -- Direct project cost
  'INDIRECT',        -- Indirect cost
  'OVERHEAD',        -- Overhead allocation
  'CAPITAL',         -- Capital expenditure
  'OPERATIONAL'      -- Operational expenditure
);

-- ============================================================================
-- MAIN TABLE: project_roles
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_roles (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Multi-tenant Isolation
  tenant_id UUID NOT NULL,
  
  -- Role Identification
  role_code VARCHAR(50) NOT NULL,
  role_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Classification
  role_category project_role_category NOT NULL,
  skill_level project_role_skill_level NOT NULL DEFAULT 'INTERMEDIATE',
  
  -- Default Configurations
  default_billing_category project_billing_category NOT NULL DEFAULT 'BILLABLE',
  default_cost_category project_cost_category NOT NULL DEFAULT 'DIRECT',
  default_resource_type project_resource_type NOT NULL DEFAULT 'INTERNAL',
  
  -- Default Activity Mapping (optional FK to project_activities)
  default_activity_id UUID,
  
  -- Hierarchy Support
  parent_role_id UUID REFERENCES project_roles(id) ON DELETE SET NULL,
  hierarchy_level INT DEFAULT 0,
  hierarchy_path TEXT, -- Materialized path (e.g., '/1/5/12')
  display_order INT DEFAULT 0,
  
  -- Organizational Grouping
  department_id UUID,
  practice_area VARCHAR(100),
  competency_group VARCHAR(100),
  delivery_unit VARCHAR(100),
  
  -- Business Rules
  requires_certification BOOLEAN DEFAULT FALSE,
  certification_type VARCHAR(255),
  min_experience_years DECIMAL(4, 1),
  max_experience_years DECIMAL(4, 1),
  allows_remote BOOLEAN DEFAULT TRUE,
  requires_onsite BOOLEAN DEFAULT FALSE,
  
  -- Billing & Cost Defaults
  standard_hourly_rate DECIMAL(12, 2),
  standard_daily_rate DECIMAL(12, 2),
  cost_center VARCHAR(50),
  profit_center VARCHAR(50),
  
  -- Capacity Planning
  default_allocation_percentage DECIMAL(5, 2) DEFAULT 100.00,
  max_concurrent_projects INT DEFAULT 3,
  
  -- Governance & Versioning
  version INT NOT NULL DEFAULT 1,
  effective_start_date DATE NOT NULL,
  effective_end_date DATE,
  status activity_status NOT NULL DEFAULT 'DRAFT',
  
  -- Custom Attributes (Extensibility)
  custom_attributes JSONB,
  tags JSONB,
  
  -- Configuration Metadata
  configuration_source VARCHAR(100),
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
  CONSTRAINT unique_tenant_role_code UNIQUE (tenant_id, role_code),
  CONSTRAINT unique_tenant_role_version UNIQUE (tenant_id, role_code, version),
  CONSTRAINT check_hierarchy_level CHECK (hierarchy_level >= 0),
  CONSTRAINT check_experience_range CHECK (
    (min_experience_years IS NULL AND max_experience_years IS NULL) OR
    (min_experience_years IS NULL OR max_experience_years IS NULL OR min_experience_years <= max_experience_years)
  )
);

-- ============================================================================
-- INDEXES for project_roles
-- ============================================================================
CREATE INDEX idx_project_roles_tenant_id ON project_roles(tenant_id);
CREATE INDEX idx_project_roles_tenant_status ON project_roles(tenant_id, status);
CREATE INDEX idx_project_roles_tenant_code ON project_roles(tenant_id, role_code);
CREATE INDEX idx_project_roles_role_category ON project_roles(role_category);
CREATE INDEX idx_project_roles_skill_level ON project_roles(skill_level);
CREATE INDEX idx_project_roles_parent_role_id ON project_roles(parent_role_id);
CREATE INDEX idx_project_roles_hierarchy_path ON project_roles(hierarchy_path);
CREATE INDEX idx_project_roles_effective_dates ON project_roles(tenant_id, effective_start_date, effective_end_date);
CREATE INDEX idx_project_roles_department ON project_roles(department_id);
CREATE INDEX idx_project_roles_practice_area ON project_roles(practice_area);
CREATE INDEX idx_project_roles_is_deleted ON project_roles(is_deleted);
CREATE INDEX idx_project_roles_created_at ON project_roles(created_at DESC);

-- ============================================================================
-- TABLE: project_role_hierarchy
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_role_hierarchy (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Multi-tenant Isolation
  tenant_id UUID NOT NULL,
  
  -- Hierarchy Relationship
  parent_role_id UUID NOT NULL REFERENCES project_roles(id) ON DELETE CASCADE,
  child_role_id UUID NOT NULL REFERENCES project_roles(id) ON DELETE CASCADE,
  
  -- Relationship Metadata
  relationship_type VARCHAR(50) DEFAULT 'REPORTS_TO', -- REPORTS_TO, LEADS, SUPERVISES
  hierarchy_depth INT NOT NULL DEFAULT 1,
  
  -- Effective Dating
  effective_start_date DATE NOT NULL,
  effective_end_date DATE,
  
  -- Audit Fields
  created_by UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_hierarchy_relationship UNIQUE (tenant_id, parent_role_id, child_role_id),
  CONSTRAINT check_no_self_reference CHECK (parent_role_id != child_role_id)
);

-- Indexes
CREATE INDEX idx_role_hierarchy_tenant ON project_role_hierarchy(tenant_id);
CREATE INDEX idx_role_hierarchy_parent ON project_role_hierarchy(parent_role_id);
CREATE INDEX idx_role_hierarchy_child ON project_role_hierarchy(child_role_id);

-- ============================================================================
-- TABLE: project_role_scope_mappings
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_role_scope_mappings (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Multi-tenant Isolation
  tenant_id UUID NOT NULL,
  
  -- Foreign Key to Role
  project_role_id UUID NOT NULL REFERENCES project_roles(id) ON DELETE CASCADE,
  
  -- Scope Definition
  scope_type activity_scope_type NOT NULL,
  scope_entity_id UUID,
  scope_entity_name VARCHAR(255),
  
  -- Scope Flags
  is_primary BOOLEAN DEFAULT FALSE,
  
  -- Effective Dating
  effective_start_date DATE NOT NULL,
  effective_end_date DATE,
  
  -- Audit Fields
  created_by UUID NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_role_scopes_tenant ON project_role_scope_mappings(tenant_id);
CREATE INDEX idx_role_scopes_role_id ON project_role_scope_mappings(tenant_id, project_role_id);
CREATE INDEX idx_role_scopes_scope_type ON project_role_scope_mappings(scope_type, scope_entity_id);

-- ============================================================================
-- TABLE: project_role_versions
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_role_versions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Multi-tenant Isolation
  tenant_id UUID NOT NULL,
  
  -- Foreign Key to Role
  project_role_id UUID NOT NULL REFERENCES project_roles(id) ON DELETE CASCADE,
  
  -- Version Information
  version_number INT NOT NULL,
  change_type VARCHAR(50) NOT NULL, -- CREATE, UPDATE, STATUS_CHANGE, HIERARCHY_CHANGE
  change_description TEXT,
  
  -- Snapshot (Complete state at this version)
  configuration_snapshot JSONB NOT NULL,
  changed_fields JSONB,
  
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
  CONSTRAINT unique_role_version UNIQUE (tenant_id, project_role_id, version_number)
);

-- Indexes
CREATE INDEX idx_role_versions_tenant ON project_role_versions(tenant_id);
CREATE INDEX idx_role_versions_role_id ON project_role_versions(tenant_id, project_role_id, version_number);
CREATE INDEX idx_role_versions_created_at ON project_role_versions(created_at DESC);

-- ============================================================================
-- TABLE: project_role_dependency_links
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_role_dependency_links (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Multi-tenant Isolation
  tenant_id UUID NOT NULL,
  
  -- Source Role
  source_role_id UUID NOT NULL REFERENCES project_roles(id) ON DELETE CASCADE,
  
  -- Dependent Entity Reference
  dependent_entity_type VARCHAR(100) NOT NULL, -- PROJECT, RATE_CARD, RESOURCE_ASSIGNMENT, BUDGET, TIMESHEET
  dependent_entity_id UUID NOT NULL,
  dependent_entity_name VARCHAR(255),
  
  -- Dependency Configuration
  dependency_type VARCHAR(50) NOT NULL, -- REQUIRED, OPTIONAL, RECOMMENDED
  is_blocking BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Metadata
  link_metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_role_deps_tenant ON project_role_dependency_links(tenant_id);
CREATE INDEX idx_role_deps_source_role ON project_role_dependency_links(tenant_id, source_role_id);
CREATE INDEX idx_role_deps_dependent_entity ON project_role_dependency_links(dependent_entity_type, dependent_entity_id);

-- ============================================================================
-- TABLE: project_role_audit_logs
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_role_audit_logs (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Multi-tenant Isolation
  tenant_id UUID NOT NULL,
  
  -- Foreign Key to Role
  project_role_id UUID NOT NULL REFERENCES project_roles(id) ON DELETE CASCADE,
  role_code VARCHAR(50) NOT NULL,
  
  -- Action Information
  action_type VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, ACTIVATE, DEACTIVATE, APPROVE, HIERARCHY_CHANGE
  action_description TEXT NOT NULL,
  
  -- State Snapshots
  before_state JSONB,
  after_state JSONB,
  changed_fields JSONB,
  
  -- User Context
  performed_by UUID NOT NULL,
  performed_by_name VARCHAR(255) NOT NULL,
  performed_by_role VARCHAR(100),
  
  -- Request Context
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Change Metadata
  change_reason TEXT,
  approval_status VARCHAR(50),
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_role_audit_tenant ON project_role_audit_logs(tenant_id);
CREATE INDEX idx_role_audit_role_id ON project_role_audit_logs(tenant_id, project_role_id, created_at DESC);
CREATE INDEX idx_role_audit_action_type ON project_role_audit_logs(action_type);
CREATE INDEX idx_role_audit_performed_by ON project_role_audit_logs(performed_by);
CREATE INDEX idx_role_audit_created_at ON project_role_audit_logs(created_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp for project_roles
CREATE OR REPLACE FUNCTION update_project_role_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_role_updated_at
BEFORE UPDATE ON project_roles
FOR EACH ROW
EXECUTE FUNCTION update_project_role_updated_at();

-- Auto-update hierarchy_path when parent changes
CREATE OR REPLACE FUNCTION update_role_hierarchy_path()
RETURNS TRIGGER AS $$
DECLARE
  parent_path TEXT;
BEGIN
  IF NEW.parent_role_id IS NULL THEN
    NEW.hierarchy_path := '/' || NEW.id::TEXT;
    NEW.hierarchy_level := 0;
  ELSE
    SELECT hierarchy_path, hierarchy_level INTO parent_path, NEW.hierarchy_level
    FROM project_roles
    WHERE id = NEW.parent_role_id;
    
    NEW.hierarchy_path := parent_path || '/' || NEW.id::TEXT;
    NEW.hierarchy_level := NEW.hierarchy_level + 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_role_hierarchy_path
BEFORE INSERT OR UPDATE OF parent_role_id ON project_roles
FOR EACH ROW
EXECUTE FUNCTION update_role_hierarchy_path();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE project_roles IS 'Enterprise project role configuration with hierarchy support';
COMMENT ON COLUMN project_roles.role_code IS 'Unique role identifier within tenant';
COMMENT ON COLUMN project_roles.parent_role_id IS 'Parent role for hierarchical structure';
COMMENT ON COLUMN project_roles.hierarchy_path IS 'Materialized path for efficient hierarchy queries';
COMMENT ON COLUMN project_roles.hierarchy_level IS 'Depth level in hierarchy (0 = root)';
COMMENT ON COLUMN project_roles.default_activity_id IS 'Default activity mapping for this role';
COMMENT ON COLUMN project_roles.practice_area IS 'Practice area grouping (e.g., Cloud, Data, Mobile)';
COMMENT ON COLUMN project_roles.competency_group IS 'Competency grouping (e.g., Engineering, Consulting)';

COMMENT ON TABLE project_role_hierarchy IS 'Explicit hierarchy relationships between roles';
COMMENT ON COLUMN project_role_hierarchy.relationship_type IS 'Type of hierarchical relationship';
COMMENT ON COLUMN project_role_hierarchy.hierarchy_depth IS 'Distance from parent (1 = direct child)';

COMMENT ON TABLE project_role_scope_mappings IS 'Organizational scope for project roles';
COMMENT ON TABLE project_role_versions IS 'Version history for role configurations';
COMMENT ON TABLE project_role_dependency_links IS 'Manages relationships between roles and dependent entities';
COMMENT ON TABLE project_role_audit_logs IS 'Comprehensive audit trail for all role changes';

-- ============================================================================
-- SAMPLE QUERIES FOR VALIDATION
-- ============================================================================

-- Query 1: Get role hierarchy tree
-- WITH RECURSIVE role_tree AS (
--   SELECT id, role_code, role_name, parent_role_id, hierarchy_level, hierarchy_path, 0 AS depth
--   FROM project_roles
--   WHERE parent_role_id IS NULL AND tenant_id = '<tenant-uuid>' AND is_deleted = FALSE
--   UNION ALL
--   SELECT r.id, r.role_code, r.role_name, r.parent_role_id, r.hierarchy_level, r.hierarchy_path, rt.depth + 1
--   FROM project_roles r
--   INNER JOIN role_tree rt ON r.parent_role_id = rt.id
--   WHERE r.tenant_id = '<tenant-uuid>' AND r.is_deleted = FALSE
-- )
-- SELECT * FROM role_tree ORDER BY hierarchy_path;

-- Query 2: Get all child roles under a parent
-- SELECT * FROM project_roles
-- WHERE hierarchy_path LIKE (
--   SELECT hierarchy_path || '/%' FROM project_roles WHERE id = '<parent-role-uuid>'
-- )
-- AND tenant_id = '<tenant-uuid>'
-- AND is_deleted = FALSE;

-- Query 3: Get role with all dependencies
-- SELECT r.*, 
--        COUNT(d.id) AS dependency_count
-- FROM project_roles r
-- LEFT JOIN project_role_dependency_links d ON r.id = d.source_role_id
-- WHERE r.tenant_id = '<tenant-uuid>' AND r.is_deleted = FALSE
-- GROUP BY r.id;

-- Query 4: Get roles by skill level and category
-- SELECT * FROM project_roles
-- WHERE tenant_id = '<tenant-uuid>'
-- AND role_category = 'DELIVERY'
-- AND skill_level IN ('SENIOR', 'EXPERT')
-- AND status = 'ACTIVE'
-- AND is_deleted = FALSE
-- ORDER BY role_name;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
