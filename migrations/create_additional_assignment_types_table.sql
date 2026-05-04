-- =====================================================
-- Additional Assignment Types Configuration Schema
-- =====================================================
-- PURPOSE: Configuration-only table for additional assignment type definitions
-- ARCHITECTURE: Zero employee data - Pure policy storage
-- SCOPE: Defines how temporary, acting, project-based, and cross-functional 
--        assignments are configured and governed system-wide
-- =====================================================

-- Create additional_assignment_types table
CREATE TABLE IF NOT EXISTS additional_assignment_types (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Tenant Scoping (Multi-tenancy support)
    tenant_id UUID NOT NULL,
    company_id UUID,
    legal_entity_id UUID,
    
    -- Assignment Type Identity
    assignment_type_code VARCHAR(50) NOT NULL,
    assignment_type_name VARCHAR(200) NOT NULL,
    description TEXT,
    assignment_category VARCHAR(100), -- Temporary, Acting, Project, Strategic, Cross-Entity, Secondment, Dual, Advisory
    display_order INTEGER DEFAULT 0,
    icon_name VARCHAR(50),
    color_code VARCHAR(20),
    
    -- Duration & Limits Configuration
    minimum_duration_days INTEGER CHECK (minimum_duration_days >= 0),
    maximum_duration_days INTEGER CHECK (maximum_duration_days >= 0),
    default_duration_days INTEGER CHECK (default_duration_days >= 0),
    auto_end_on_expiry BOOLEAN DEFAULT FALSE,
    extension_allowed BOOLEAN DEFAULT TRUE,
    maximum_extensions_count INTEGER CHECK (maximum_extensions_count >= 0),
    extension_approval_required BOOLEAN DEFAULT FALSE,
    cooling_off_period_days INTEGER CHECK (cooling_off_period_days >= 0),
    allow_overlapping_assignments BOOLEAN DEFAULT FALSE,
    
    -- Payroll & Compensation Impact (Configuration Flags)
    allow_additional_allowance BOOLEAN DEFAULT FALSE,
    allow_temporary_salary_uplift BOOLEAN DEFAULT FALSE,
    default_salary_uplift_percentage NUMERIC(5, 2) CHECK (default_salary_uplift_percentage BETWEEN 0 AND 100),
    overtime_eligibility_impact BOOLEAN DEFAULT FALSE,
    overtime_eligibility_rule VARCHAR(50), -- Enabled, Disabled, Inherited
    bonus_eligibility_impact BOOLEAN DEFAULT FALSE,
    bonus_eligibility_rule VARCHAR(50), -- Prorated, Full, None, Inherited
    cost_center_override_allowed BOOLEAN DEFAULT FALSE,
    multiple_assignment_pay_stacking_allowed BOOLEAN DEFAULT FALSE,
    payroll_integration_code VARCHAR(100),
    
    -- Authority & Delegation Controls
    delegation_of_authority_allowed BOOLEAN DEFAULT FALSE,
    financial_approval_limit_override BOOLEAN DEFAULT FALSE,
    financial_approval_limit_amount NUMERIC(15, 2) CHECK (financial_approval_limit_amount >= 0),
    signing_authority_enabled BOOLEAN DEFAULT FALSE,
    system_role_elevation_allowed BOOLEAN DEFAULT FALSE,
    elevated_system_roles JSONB, -- Array of role codes
    conflict_of_interest_flag BOOLEAN DEFAULT FALSE,
    conflict_check_required BOOLEAN DEFAULT FALSE,
    
    -- Leave, Attendance & Working Time Impact
    leave_policy_override_allowed BOOLEAN DEFAULT FALSE,
    override_leave_policy_id UUID,
    shift_override_allowed BOOLEAN DEFAULT FALSE,
    location_based_attendance_rules BOOLEAN DEFAULT FALSE,
    work_location_enforcement VARCHAR(50), -- Remote, OnSite, Hybrid, Inherited
    holiday_calendar_override_allowed BOOLEAN DEFAULT FALSE,
    override_holiday_calendar_id UUID,
    working_hours_override_allowed BOOLEAN DEFAULT FALSE,
    
    -- Compliance & Legal Configuration
    applicable_country_code VARCHAR(10),
    applicable_countries JSONB, -- Array of country codes for multi-country support
    applicable_legal_entities JSONB, -- Array of legal entity UUIDs
    union_applicable BOOLEAN DEFAULT FALSE,
    cba_applicable BOOLEAN DEFAULT FALSE,
    cba_reference VARCHAR(200),
    work_permit_dependency BOOLEAN DEFAULT FALSE,
    regulatory_reporting_required BOOLEAN DEFAULT FALSE,
    regulatory_reporting_code VARCHAR(100),
    labor_law_reference VARCHAR(500),
    
    -- Lifecycle Interaction Rules
    behavior_during_notice_period VARCHAR(50), -- AutoTerminate, Freeze, AllowCompletion, ManualReview
    behavior_during_retirement VARCHAR(50),
    behavior_during_separation VARCHAR(50),
    behavior_during_long_leave VARCHAR(50),
    behavior_during_suspension VARCHAR(50),
    auto_terminate_on_primary_role_change BOOLEAN DEFAULT FALSE,
    auto_terminate_on_transfer BOOLEAN DEFAULT FALSE,
    auto_terminate_on_promotion BOOLEAN DEFAULT FALSE,
    
    -- Approval & Governance Configuration
    approval_workflow_required BOOLEAN DEFAULT TRUE,
    approval_authority_level VARCHAR(50), -- Manager, HR, Legal, Executive
    dual_approval_required BOOLEAN DEFAULT FALSE,
    legal_approval_required BOOLEAN DEFAULT FALSE,
    executive_approval_required BOOLEAN DEFAULT FALSE,
    mandatory_justification BOOLEAN DEFAULT FALSE,
    minimum_justification_length INTEGER CHECK (minimum_justification_length >= 0),
    required_documents JSONB, -- Array of document types
    custom_approval_workflow_triggers JSONB,
    
    -- Security, Visibility & Audit Controls
    visibility_scope VARCHAR(50), -- Public, ManagerOnly, HROnly, Restricted
    mask_in_employee_view BOOLEAN DEFAULT FALSE,
    masked_display_name VARCHAR(200),
    manager_visible BOOLEAN DEFAULT TRUE,
    hr_visible BOOLEAN DEFAULT TRUE,
    employee_self_view_allowed BOOLEAN DEFAULT FALSE,
    audit_logging_enabled BOOLEAN DEFAULT TRUE,
    historical_tracking_enabled BOOLEAN DEFAULT TRUE,
    sensitive_assignment BOOLEAN DEFAULT FALSE,
    sensitivity_classification VARCHAR(100), -- Confidential, Restricted, Public
    
    -- Planning & Workforce Strategy Tags
    succession_relevance BOOLEAN DEFAULT FALSE,
    critical_role_exposure BOOLEAN DEFAULT FALSE,
    skill_development_indicator BOOLEAN DEFAULT FALSE,
    skill_development_category VARCHAR(100),
    leadership_pipeline_indicator BOOLEAN DEFAULT FALSE,
    workforce_planning_category VARCHAR(100), -- Talent Development, Coverage, Strategic, Operational
    strategic_tags JSONB,
    counts_as_leadership_experience BOOLEAN DEFAULT FALSE,
    performance_review_impact BOOLEAN DEFAULT FALSE,
    
    -- Reporting & Analytics Configuration
    include_in_headcount BOOLEAN DEFAULT TRUE,
    include_in_org_chart BOOLEAN DEFAULT TRUE,
    org_chart_display_mode VARCHAR(50), -- DottedLine, SolidLine, Separate, Hidden
    include_in_workforce_reports BOOLEAN DEFAULT TRUE,
    analytics_tags JSONB,
    reporting_category VARCHAR(100),
    
    -- Integration & External System Mapping
    external_system_code VARCHAR(100),
    integration_mapping JSONB,
    sync_to_payroll BOOLEAN DEFAULT FALSE,
    sync_to_time_attendance BOOLEAN DEFAULT FALSE,
    sync_to_access_control BOOLEAN DEFAULT FALSE,
    
    -- Effective Dating & Version Control
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_historical BOOLEAN DEFAULT FALSE,
    superseded_by UUID,
    supersedes UUID,
    version_number INTEGER DEFAULT 1,
    version_notes TEXT,
    
    -- Status & Governance
    is_active BOOLEAN DEFAULT TRUE,
    is_system_defined BOOLEAN DEFAULT FALSE,
    allow_deletion BOOLEAN DEFAULT TRUE,
    deactivation_reason TEXT,
    deactivated_at TIMESTAMP,
    deactivated_by UUID,
    
    -- Usage Tracking (Transactional Counts - No Employee Data)
    active_assignments_count INTEGER DEFAULT 0 CHECK (active_assignments_count >= 0),
    total_assignments_count INTEGER DEFAULT 0 CHECK (total_assignments_count >= 0),
    last_used_at TIMESTAMP,
    
    -- Audit Trail
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    audit_metadata JSONB,
    
    -- Constraints
    CONSTRAINT chk_effective_dates CHECK (effective_to IS NULL OR effective_to >= effective_from),
    CONSTRAINT chk_duration_logic CHECK (
        minimum_duration_days IS NULL OR 
        maximum_duration_days IS NULL OR 
        minimum_duration_days <= maximum_duration_days
    )
);

-- =====================================================
-- INDEXES for Performance Optimization
-- =====================================================

-- Basic Indexes
CREATE INDEX idx_assignment_types_tenant ON additional_assignment_types(tenant_id);
CREATE INDEX idx_assignment_types_company ON additional_assignment_types(company_id);
CREATE INDEX idx_assignment_types_legal_entity ON additional_assignment_types(legal_entity_id);
CREATE UNIQUE INDEX idx_assignment_types_code_unique ON additional_assignment_types(tenant_id, assignment_type_code);
CREATE INDEX idx_assignment_types_category ON additional_assignment_types(assignment_category);
CREATE INDEX idx_assignment_types_active ON additional_assignment_types(is_active);
CREATE INDEX idx_assignment_types_display_order ON additional_assignment_types(display_order);

-- Effective Date Indexes
CREATE INDEX idx_assignment_types_effective_from ON additional_assignment_types(effective_from);
CREATE INDEX idx_assignment_types_effective_to ON additional_assignment_types(effective_to);

-- Composite Indexes
CREATE INDEX idx_assignment_types_tenant_active ON additional_assignment_types(tenant_id, is_active);
CREATE INDEX idx_assignment_types_tenant_category ON additional_assignment_types(tenant_id, assignment_category);
CREATE INDEX idx_assignment_types_tenant_effective ON additional_assignment_types(tenant_id, effective_from, effective_to);

-- Usage Tracking Indexes
CREATE INDEX idx_assignment_types_usage_count ON additional_assignment_types(total_assignments_count DESC);
CREATE INDEX idx_assignment_types_last_used ON additional_assignment_types(last_used_at);

-- Approval & Governance Indexes
CREATE INDEX idx_assignment_types_dual_approval ON additional_assignment_types(dual_approval_required) WHERE dual_approval_required = TRUE;
CREATE INDEX idx_assignment_types_legal_approval ON additional_assignment_types(legal_approval_required) WHERE legal_approval_required = TRUE;
CREATE INDEX idx_assignment_types_executive_approval ON additional_assignment_types(executive_approval_required) WHERE executive_approval_required = TRUE;

-- JSONB Indexes for Array Searches
CREATE INDEX idx_assignment_types_applicable_countries ON additional_assignment_types USING GIN (applicable_countries);
CREATE INDEX idx_assignment_types_applicable_legal_entities ON additional_assignment_types USING GIN (applicable_legal_entities);
CREATE INDEX idx_assignment_types_analytics_tags ON additional_assignment_types USING GIN (analytics_tags);
CREATE INDEX idx_assignment_types_strategic_tags ON additional_assignment_types USING GIN (strategic_tags);

-- =====================================================
-- COMMENTS for Documentation
-- =====================================================

COMMENT ON TABLE additional_assignment_types IS 'CONFIGURATION-ONLY: Defines additional assignment type policies and behavioral rules. Zero employee data - pure policy storage for temporary, acting, project-based, and cross-functional assignment governance.';

COMMENT ON COLUMN additional_assignment_types.tenant_id IS 'Tenant isolation - all assignment types are tenant-scoped';
COMMENT ON COLUMN additional_assignment_types.assignment_type_code IS 'Unique code per tenant (e.g., ACTING, TEMP, PROJ, SECOND)';
COMMENT ON COLUMN additional_assignment_types.assignment_category IS 'Category grouping: Temporary, Acting, Project, Strategic, Cross-Entity, Secondment, Dual, Advisory';
COMMENT ON COLUMN additional_assignment_types.minimum_duration_days IS 'Minimum assignment duration in days';
COMMENT ON COLUMN additional_assignment_types.maximum_duration_days IS 'Maximum assignment duration in days';
COMMENT ON COLUMN additional_assignment_types.cooling_off_period_days IS 'Minimum gap required between assignments of same type';
COMMENT ON COLUMN additional_assignment_types.allow_temporary_salary_uplift IS 'Whether this assignment type permits temporary salary increases';
COMMENT ON COLUMN additional_assignment_types.delegation_of_authority_allowed IS 'Whether authority can be delegated during this assignment';
COMMENT ON COLUMN additional_assignment_types.behavior_during_notice_period IS 'Defines how assignment behaves when employee is in notice period: AutoTerminate, Freeze, AllowCompletion, ManualReview';
COMMENT ON COLUMN additional_assignment_types.approval_workflow_required IS 'Whether approval workflow is required for creating this assignment type';
COMMENT ON COLUMN additional_assignment_types.dual_approval_required IS 'Whether dual approval is required (e.g., HR + Manager)';
COMMENT ON COLUMN additional_assignment_types.succession_relevance IS 'Whether this assignment type is relevant for succession planning';
COMMENT ON COLUMN additional_assignment_types.leadership_pipeline_indicator IS 'Whether this assignment counts towards leadership pipeline development';
COMMENT ON COLUMN additional_assignment_types.active_assignments_count IS 'TRANSACTIONAL COUNT: Number of currently active assignments (not employee records)';
COMMENT ON COLUMN additional_assignment_types.total_assignments_count IS 'TRANSACTIONAL COUNT: Historical total usage (not employee records)';

-- =====================================================
-- SAMPLE STARTER DATA (Optional - Common Assignment Types)
-- =====================================================

-- Note: Replace '00000000-0000-0000-0000-000000000000' with actual tenant_id
-- These are common templates that admins can customize

INSERT INTO additional_assignment_types (
    tenant_id, assignment_type_code, assignment_type_name, description, assignment_category,
    display_order, color_code, minimum_duration_days, maximum_duration_days, default_duration_days,
    extension_allowed, approval_workflow_required, effective_from, is_active
) VALUES
-- Acting Role Assignment
('00000000-0000-0000-0000-000000000000', 'ACTING', 'Acting Role Assignment', 
 'Temporary assumption of a higher-level role with associated responsibilities and authority', 'Acting',
 1, '#3B82F6', 30, 180, 90, TRUE, TRUE, '2026-01-01', TRUE),

-- Temporary Assignment
('00000000-0000-0000-0000-000000000000', 'TEMP', 'Temporary Assignment', 
 'Short-term assignment to another role, department, or location to meet business needs', 'Temporary',
 2, '#10B981', 14, 90, 30, TRUE, TRUE, '2026-01-01', TRUE),

-- Project Assignment
('00000000-0000-0000-0000-000000000000', 'PROJ', 'Project Assignment', 
 'Assignment to a specific project while maintaining primary role responsibilities', 'Project',
 3, '#8B5CF6', 30, 365, 180, TRUE, TRUE, '2026-01-01', TRUE),

-- Secondment
('00000000-0000-0000-0000-000000000000', 'SECOND', 'Secondment', 
 'Formal transfer to another entity or department for an extended period', 'Cross-Entity',
 4, '#F59E0B', 90, 730, 365, TRUE, TRUE, '2026-01-01', TRUE),

-- Dual Role Assignment
('00000000-0000-0000-0000-000000000000', 'DUAL', 'Dual Role Assignment', 
 'Concurrent assignment to two roles with balanced responsibilities', 'Dual',
 5, '#EF4444', 30, 365, 180, TRUE, TRUE, '2026-01-01', TRUE),

-- Advisory/Committee Role
('00000000-0000-0000-0000-000000000000', 'ADVISORY', 'Advisory/Committee Role', 
 'Advisory or committee membership role (e.g., Safety Committee, Ethics Board)', 'Advisory',
 6, '#06B6D4', 90, 1095, 365, TRUE, FALSE, '2026-01-01', TRUE),

-- Strategic Assignment
('00000000-0000-0000-0000-000000000000', 'STRATEGIC', 'Strategic Assignment', 
 'High-level strategic assignment for organizational transformation or special projects', 'Strategic',
 7, '#EC4899', 90, 540, 180, TRUE, TRUE, '2026-01-01', TRUE);

-- =====================================================
-- END OF MIGRATION
-- =====================================================
