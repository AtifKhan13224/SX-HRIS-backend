-- ============================================================================
-- PROJECT ACTIVITY CONFIGURATION TABLES
-- Enterprise-grade activity management for project management system
-- ============================================================================

-- Create ENUM types for activity configuration
CREATE TYPE activity_category AS ENUM (
  'DELIVERY',
  'SUPPORT',
  'MAINTENANCE',
  'DEVELOPMENT',
  'CONSULTING',
  'TRAINING',
  'RESEARCH',
  'ADMINISTRATION',
  'QUALITY_ASSURANCE',
  'PROJECT_MANAGEMENT',
  'OTHER'
);

CREATE TYPE activity_type AS ENUM (
  'OPERATIONAL',
  'DELIVERY',
  'SUPPORT',
  'INTERNAL'
);

CREATE TYPE activity_status AS ENUM (
  'DRAFT',
  'ACTIVE',
  'INACTIVE',
  'DEPRECATED',
  'PENDING_APPROVAL'
);

CREATE TYPE activity_scope_type AS ENUM (
  'GLOBAL',
  'LEGAL_ENTITY',
  'BUSINESS_UNIT',
  'DEPARTMENT',
  'COUNTRY',
  'PROJECT_TYPE'
);

-- ============================================================================
-- TABLE: project_activities
-- Main activity configuration registry
-- ============================================================================
CREATE TABLE project_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  
  -- Activity Identification
  activity_code VARCHAR(50) NOT NULL,
  activity_name VARCHAR(255) NOT NULL,
  description TEXT,
  activity_category activity_category NOT NULL,
  activity_type activity_type NOT NULL,
  
  -- Configuration Attributes
  is_billable BOOLEAN DEFAULT TRUE,
  is_timesheet_required BOOLEAN DEFAULT TRUE,
  is_resource_allocation_enabled BOOLEAN DEFAULT TRUE,
  is_budget_tracked BOOLEAN DEFAULT FALSE,
  
  -- Default Associations
  default_project_role_id UUID,
  default_rate_card_id UUID,
  default_approval_workflow_id UUID,
  
  -- Governance & Versioning
  version INTEGER DEFAULT 1,
  effective_start_date DATE NOT NULL,
  effective_end_date DATE,
  status activity_status DEFAULT 'DRAFT',
  
  -- Hierarchy
  parent_activity_id UUID,
  display_order INTEGER DEFAULT 0,
  
  -- Business Rules
  allow_sub_activities BOOLEAN DEFAULT TRUE,
  requires_approval BOOLEAN DEFAULT FALSE,
  allow_overtime BOOLEAN DEFAULT FALSE,
  max_hours_per_day DECIMAL(5,2),
  
  -- Custom Attributes (JSON for extensibility)
  custom_attributes JSONB,
  
  -- Configuration Metadata
  configuration_source VARCHAR(100),
  external_reference_id VARCHAR(255),
  tags JSONB,
  
  -- Approval
  approved_by UUID,
  approved_at TIMESTAMP,
  approval_notes TEXT,
  
  -- Audit Fields
  created_by UUID NOT NULL,
  updated_by UUID,
  deactivated_by UUID,
  deactivated_at TIMESTAMP,
  deactivation_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Soft Delete
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  deleted_by UUID,
  
  -- Constraints
  CONSTRAINT uq_activity_code_version UNIQUE (tenant_id, activity_code, version),
  CONSTRAINT fk_parent_activity FOREIGN KEY (parent_activity_id) 
    REFERENCES project_activities(id) ON DELETE SET NULL
);

-- Indexes for project_activities
CREATE INDEX idx_activities_tenant ON project_activities(tenant_id);
CREATE INDEX idx_activities_tenant_status ON project_activities(tenant_id, status);
CREATE INDEX idx_activities_tenant_code ON project_activities(tenant_id, activity_code);
CREATE INDEX idx_activities_effective_dates ON project_activities(tenant_id, effective_start_date, effective_end_date);
CREATE INDEX idx_activities_category ON project_activities(activity_category);
CREATE INDEX idx_activities_type ON project_activities(activity_type);
CREATE INDEX idx_activities_billable ON project_activities(is_billable);
CREATE INDEX idx_activities_parent ON project_activities(parent_activity_id);
CREATE INDEX idx_activities_deleted ON project_activities(is_deleted);

-- ============================================================================
-- TABLE: activity_scope_mappings
-- Organizational scope control for activities
-- ============================================================================
CREATE TABLE activity_scope_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  activity_id UUID NOT NULL,
  
  scope_type activity_scope_type NOT NULL,
  scope_entity_id UUID,
  scope_entity_name VARCHAR(255),
  is_primary BOOLEAN DEFAULT FALSE,
  
  effective_start_date DATE NOT NULL,
  effective_end_date DATE,
  
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_scope_activity FOREIGN KEY (activity_id) 
    REFERENCES project_activities(id) ON DELETE CASCADE
);

-- Indexes for activity_scope_mappings
CREATE INDEX idx_scope_tenant_activity ON activity_scope_mappings(tenant_id, activity_id);
CREATE INDEX idx_scope_type ON activity_scope_mappings(scope_type);
CREATE INDEX idx_scope_entity ON activity_scope_mappings(scope_entity_id);

-- ============================================================================
-- TABLE: activity_versions
-- Track configuration changes over time
-- ============================================================================
CREATE TABLE activity_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  activity_id UUID NOT NULL,
  
  version_number INTEGER NOT NULL,
  change_type VARCHAR(50) NOT NULL,
  change_description TEXT,
  
  configuration_snapshot JSONB NOT NULL,
  changed_fields JSONB,
  
  effective_from TIMESTAMP NOT NULL,
  effective_to TIMESTAMP,
  
  change_reason TEXT,
  changed_by UUID NOT NULL,
  approved_by UUID,
  approved_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_version_activity FOREIGN KEY (activity_id) 
    REFERENCES project_activities(id) ON DELETE CASCADE
);

-- Indexes for activity_versions
CREATE INDEX idx_versions_tenant_activity ON activity_versions(tenant_id, activity_id);
CREATE INDEX idx_versions_number ON activity_versions(activity_id, version_number);
CREATE INDEX idx_versions_effective ON activity_versions(effective_from, effective_to);

-- ============================================================================
-- TABLE: activity_dependency_links
-- Manage relationships and prevent orphaned references
-- ============================================================================
CREATE TABLE activity_dependency_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  source_activity_id UUID NOT NULL,
  
  dependent_entity_type VARCHAR(100) NOT NULL,
  dependent_entity_id UUID NOT NULL,
  dependent_entity_name VARCHAR(255),
  
  dependency_type VARCHAR(50) NOT NULL,
  is_blocking BOOLEAN DEFAULT TRUE,
  
  link_metadata JSONB,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_dependency_activity FOREIGN KEY (source_activity_id) 
    REFERENCES project_activities(id) ON DELETE CASCADE
);

-- Indexes for activity_dependency_links
CREATE INDEX idx_dependencies_tenant_activity ON activity_dependency_links(tenant_id, source_activity_id);
CREATE INDEX idx_dependencies_entity ON activity_dependency_links(dependent_entity_type, dependent_entity_id);
CREATE INDEX idx_dependencies_blocking ON activity_dependency_links(is_blocking);

-- ============================================================================
-- TABLE: activity_audit_logs
-- Comprehensive audit trail for compliance
-- ============================================================================
CREATE TABLE activity_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  activity_id UUID NOT NULL,
  activity_code VARCHAR(50) NOT NULL,
  
  action_type VARCHAR(50) NOT NULL,
  action_description TEXT NOT NULL,
  
  before_state JSONB,
  after_state JSONB,
  changed_fields JSONB,
  
  performed_by UUID NOT NULL,
  performed_by_name VARCHAR(255) NOT NULL,
  performed_by_role VARCHAR(100),
  
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  change_reason TEXT,
  approval_status VARCHAR(50),
  session_id VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_audit_activity FOREIGN KEY (activity_id) 
    REFERENCES project_activities(id) ON DELETE CASCADE
);

-- Indexes for activity_audit_logs
CREATE INDEX idx_audit_tenant_activity ON activity_audit_logs(tenant_id, activity_id);
CREATE INDEX idx_audit_activity_created ON activity_audit_logs(activity_id, created_at);
CREATE INDEX idx_audit_action_type ON activity_audit_logs(action_type);
CREATE INDEX idx_audit_performed_by ON activity_audit_logs(performed_by);
CREATE INDEX idx_audit_created ON activity_audit_logs(created_at);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON project_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scope_mappings_updated_at
  BEFORE UPDATE ON activity_scope_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dependency_links_updated_at
  BEFORE UPDATE ON activity_dependency_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE project_activities IS 'Enterprise activity configuration registry for project management, timesheets, and resource allocation';
COMMENT ON TABLE activity_scope_mappings IS 'Organizational scope control defining where activities can be used';
COMMENT ON TABLE activity_versions IS 'Version history tracking all configuration changes over time';
COMMENT ON TABLE activity_dependency_links IS 'Dependency tracking to prevent deletion of referenced activities';
COMMENT ON TABLE activity_audit_logs IS 'Comprehensive audit trail for compliance and change tracking';

-- ============================================================================
-- GRANT NECESSARY PERMISSIONS (Adjust based on your DB user setup)
-- ============================================================================
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- ============================================================================
-- SAMPLE DATA (Optional - For Testing)
-- ============================================================================
-- INSERT INTO project_activities (
--   tenant_id, activity_code, activity_name, description,
--   activity_category, activity_type, is_billable,
--   effective_start_date, status, created_by
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000000',
--   'DEV-001',
--   'Software Development',
--   'General software development activities',
--   'DEVELOPMENT',
--   'DELIVERY',
--   TRUE,
--   CURRENT_DATE,
--   'ACTIVE',
--   '00000000-0000-0000-0000-000000000000'
-- );
