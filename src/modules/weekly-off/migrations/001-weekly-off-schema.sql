-- ====================================================================
-- WEEKLY OFF SETTINGS - DATABASE MIGRATION
-- Enterprise HRIS System - Production Ready
-- ====================================================================

-- 1. WEEKLY OFF POLICIES TABLE
CREATE TABLE IF NOT EXISTS weekly_off_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    policy_name VARCHAR(255) NOT NULL,
    policy_code VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    weekly_off_type VARCHAR(50) NOT NULL CHECK (weekly_off_type IN ('FIXED', 'ROTATIONAL', 'SHIFT_BASED', 'FLEXIBLE_COMPRESSED', 'CUSTOM')),
    configuration_level VARCHAR(50) NOT NULL CHECK (configuration_level IN ('GLOBAL', 'COUNTRY', 'LEGAL_ENTITY', 'BUSINESS_UNIT', 'LOCATION', 'DEPARTMENT', 'SHIFT', 'EMPLOYEE')),
    reference_id UUID,
    priority INTEGER DEFAULT 100,
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_active BOOLEAN DEFAULT TRUE,
    country_id UUID,
    is_compliant BOOLEAN DEFAULT TRUE,
    compliance_warnings JSONB,
    created_by UUID NOT NULL,
    updated_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for weekly_off_policies
CREATE INDEX idx_weekly_off_policies_tenant ON weekly_off_policies(tenant_id);
CREATE INDEX idx_weekly_off_policies_active ON weekly_off_policies(tenant_id, is_active, effective_from);
CREATE INDEX idx_weekly_off_policies_level ON weekly_off_policies(tenant_id, configuration_level, reference_id);
CREATE INDEX idx_weekly_off_policies_country ON weekly_off_policies(country_id);
CREATE INDEX idx_weekly_off_policies_code ON weekly_off_policies(policy_code);

-- 2. WEEKLY OFF PATTERNS TABLE
CREATE TABLE IF NOT EXISTS weekly_off_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id UUID NOT NULL REFERENCES weekly_off_policies(id) ON DELETE CASCADE,
    pattern_name VARCHAR(255) NOT NULL,
    off_days JSONB NOT NULL,
    working_days_cycle INTEGER,
    off_days_cycle INTEGER,
    rotation_start_date DATE,
    hours_per_day DECIMAL(5,2),
    days_per_week INTEGER,
    is_paid BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for weekly_off_patterns
CREATE INDEX idx_weekly_off_patterns_policy ON weekly_off_patterns(policy_id, is_active);

-- 3. WEEKLY OFF ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS weekly_off_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    policy_id UUID NOT NULL REFERENCES weekly_off_policies(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_active BOOLEAN DEFAULT TRUE,
    is_override BOOLEAN DEFAULT FALSE,
    override_reason TEXT,
    requires_approval BOOLEAN DEFAULT FALSE,
    approval_status VARCHAR(50),
    approved_by UUID,
    approved_at TIMESTAMP,
    created_by UUID NOT NULL,
    updated_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for weekly_off_assignments
CREATE INDEX idx_weekly_off_assignments_tenant ON weekly_off_assignments(tenant_id);
CREATE INDEX idx_weekly_off_assignments_entity ON weekly_off_assignments(tenant_id, entity_type, entity_id, is_active);
CREATE INDEX idx_weekly_off_assignments_policy ON weekly_off_assignments(policy_id, effective_from, effective_to);

-- 4. COUNTRY LABOR LAWS TABLE
CREATE TABLE IF NOT EXISTS country_labor_laws (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    country_id UUID NOT NULL,
    country_code VARCHAR(3) NOT NULL,
    country_name VARCHAR(255) NOT NULL,
    law_version VARCHAR(50) NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE,
    minimum_rest_days_per_week INTEGER DEFAULT 1,
    maximum_consecutive_working_days INTEGER DEFAULT 6,
    minimum_rest_hours DECIMAL(5,2) DEFAULT 11,
    standard_working_hours_per_week DECIMAL(5,2) DEFAULT 40,
    maximum_working_hours_per_week DECIMAL(5,2) DEFAULT 48,
    is_weekly_off_paid BOOLEAN DEFAULT TRUE,
    mandatory_weekly_off_days JSONB,
    weekly_off_ot_multiplier DECIMAL(5,2) DEFAULT 2.0,
    requires_comp_off BOOLEAN DEFAULT FALSE,
    additional_rules JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    source_reference TEXT,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for country_labor_laws
CREATE INDEX idx_country_labor_laws_country ON country_labor_laws(country_code, effective_from, is_active);
CREATE INDEX idx_country_labor_laws_tenant ON country_labor_laws(tenant_id, country_id);

-- 5. LABOR LAW COMPLIANCE RULES TABLE
CREATE TABLE IF NOT EXISTS labor_law_compliance_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    labor_law_id UUID NOT NULL REFERENCES country_labor_laws(id) ON DELETE CASCADE,
    rule_code VARCHAR(100) NOT NULL UNIQUE,
    rule_name VARCHAR(255) NOT NULL,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('MINIMUM_REST_DAYS', 'MAXIMUM_CONSECUTIVE_DAYS', 'MINIMUM_REST_HOURS', 'PAID_WEEKLY_OFF', 'WEEKLY_OFF_COMPENSATION', 'OVERTIME_MULTIPLIER')),
    description TEXT,
    rule_definition JSONB NOT NULL,
    severity VARCHAR(20) DEFAULT 'WARNING' CHECK (severity IN ('BLOCKING', 'WARNING', 'INFO')),
    error_message TEXT NOT NULL,
    priority INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for labor_law_compliance_rules
CREATE INDEX idx_compliance_rules_law ON labor_law_compliance_rules(labor_law_id, rule_type, is_active);
CREATE INDEX idx_compliance_rules_code ON labor_law_compliance_rules(rule_code);

-- 6. COMPLIANCE VALIDATION LOGS TABLE
CREATE TABLE IF NOT EXISTS compliance_validation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    policy_id UUID NOT NULL,
    assignment_id UUID,
    employee_id UUID,
    country_id UUID NOT NULL,
    validation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    validation_status VARCHAR(50) NOT NULL,
    rules_executed JSONB NOT NULL,
    violations_found JSONB,
    warnings JSONB,
    validation_context JSONB,
    validated_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for compliance_validation_logs
CREATE INDEX idx_validation_logs_tenant ON compliance_validation_logs(tenant_id, validation_date);
CREATE INDEX idx_validation_logs_policy ON compliance_validation_logs(policy_id, validation_status);

-- 7. EMPLOYEE WORK CALENDARS TABLE
CREATE TABLE IF NOT EXISTS employee_work_calendars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    employee_id UUID NOT NULL,
    calendar_date DATE NOT NULL,
    day_type VARCHAR(50) NOT NULL CHECK (day_type IN ('WORKING_DAY', 'WEEKLY_OFF', 'PUBLIC_HOLIDAY', 'PAID_LEAVE', 'UNPAID_LEAVE', 'REST_DAY', 'COMP_OFF', 'ATTENDANCE_EXCEPTION')),
    is_working_day BOOLEAN NOT NULL,
    is_paid_day BOOLEAN NOT NULL,
    source_policy_id UUID,
    source_type VARCHAR(100),
    planned_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    shift_id UUID,
    shift_start_time TIME,
    shift_end_time TIME,
    resolution_priority INTEGER DEFAULT 100,
    has_conflicts BOOLEAN DEFAULT FALSE,
    conflict_details JSONB,
    is_override BOOLEAN DEFAULT FALSE,
    override_reason TEXT,
    override_approved_by UUID,
    override_approved_at TIMESTAMP,
    metadata JSONB,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_recalculated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, employee_id, calendar_date)
);

-- Indexes for employee_work_calendars
CREATE INDEX idx_work_calendars_employee ON employee_work_calendars(tenant_id, employee_id, calendar_date);
CREATE INDEX idx_work_calendars_date ON employee_work_calendars(employee_id, calendar_date);

-- 8. WEEKLY OFF OVERRIDES TABLE
CREATE TABLE IF NOT EXISTS weekly_off_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    employee_id UUID NOT NULL,
    override_date DATE NOT NULL,
    override_type VARCHAR(50) NOT NULL CHECK (override_type IN ('MANUAL', 'SHIFT_SWAP', 'EMERGENCY', 'BUSINESS_REQUIREMENT')),
    original_day_type VARCHAR(50) NOT NULL,
    new_day_type VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    requires_compensation BOOLEAN DEFAULT FALSE,
    compensation_type VARCHAR(50),
    compensation_date DATE,
    ot_multiplier DECIMAL(5,2),
    approval_status VARCHAR(50) DEFAULT 'PENDING',
    requested_by UUID NOT NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by UUID,
    approved_at TIMESTAMP,
    approval_comments TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for weekly_off_overrides
CREATE INDEX idx_overrides_employee ON weekly_off_overrides(tenant_id, employee_id, override_date);
CREATE INDEX idx_overrides_approval ON weekly_off_overrides(approval_status, is_active);

-- 9. CALENDAR RESOLUTION RULES TABLE
CREATE TABLE IF NOT EXISTS calendar_resolution_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    rule_name VARCHAR(255) NOT NULL,
    rule_code VARCHAR(100) NOT NULL UNIQUE,
    day_type_priority JSONB NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for calendar_resolution_rules
CREATE INDEX idx_resolution_rules_tenant ON calendar_resolution_rules(tenant_id, is_active);
CREATE INDEX idx_resolution_rules_code ON calendar_resolution_rules(rule_code);

-- 10. WEEKLY OFF AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS weekly_off_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    policy_id UUID,
    assignment_id UUID,
    action_type VARCHAR(100) NOT NULL,
    action_by UUID NOT NULL,
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    old_values JSONB,
    new_values JSONB,
    affected_employees JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    remarks TEXT
);

-- Indexes for weekly_off_audit_logs
CREATE INDEX idx_audit_logs_tenant ON weekly_off_audit_logs(tenant_id, policy_id, action_date);
CREATE INDEX idx_audit_logs_action ON weekly_off_audit_logs(action_type, action_date);

-- ====================================================================
-- INSERT DEFAULT DATA
-- ====================================================================

-- Insert default calendar resolution rule
INSERT INTO calendar_resolution_rules (
    tenant_id,
    rule_name,
    rule_code,
    day_type_priority,
    description,
    is_active,
    effective_from
) VALUES (
    '00000000-0000-0000-0000-000000000000', -- Default tenant
    'Default Calendar Resolution',
    'DEFAULT_RESOLUTION',
    '{"PAID_LEAVE": 1, "UNPAID_LEAVE": 2, "PUBLIC_HOLIDAY": 3, "COMP_OFF": 4, "WEEKLY_OFF": 5, "REST_DAY": 6, "ATTENDANCE_EXCEPTION": 7, "WORKING_DAY": 8}',
    'Default priority for resolving calendar conflicts',
    true,
    CURRENT_DATE
) ON CONFLICT (rule_code) DO NOTHING;

-- ====================================================================
-- FUNCTIONS AND TRIGGERS
-- ====================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_weekly_off_policies_updated_at BEFORE UPDATE ON weekly_off_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_weekly_off_patterns_updated_at BEFORE UPDATE ON weekly_off_patterns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_weekly_off_assignments_updated_at BEFORE UPDATE ON weekly_off_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_country_labor_laws_updated_at BEFORE UPDATE ON country_labor_laws FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_labor_law_compliance_rules_updated_at BEFORE UPDATE ON labor_law_compliance_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employee_work_calendars_updated_at BEFORE UPDATE ON employee_work_calendars FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_weekly_off_overrides_updated_at BEFORE UPDATE ON weekly_off_overrides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_resolution_rules_updated_at BEFORE UPDATE ON calendar_resolution_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================================
-- GRANTS (Adjust as per your role structure)
-- ====================================================================

-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO hris_app_role;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO hris_app_role;

-- ====================================================================
-- COMMENTS
-- ====================================================================

COMMENT ON TABLE weekly_off_policies IS 'Stores weekly off policy configurations at various organizational levels';
COMMENT ON TABLE weekly_off_patterns IS 'Defines the actual weekly off patterns (fixed, rotational, etc.)';
COMMENT ON TABLE weekly_off_assignments IS 'Maps policies to organizational entities or employees';
COMMENT ON TABLE country_labor_laws IS 'Country-specific labor law requirements for weekly offs';
COMMENT ON TABLE labor_law_compliance_rules IS 'Detailed compliance rules for validating weekly off policies';
COMMENT ON TABLE compliance_validation_logs IS 'Audit trail of all compliance validations performed';
COMMENT ON TABLE employee_work_calendars IS 'Pre-calculated work calendar for each employee';
COMMENT ON TABLE weekly_off_overrides IS 'Temporary overrides for weekly off assignments';
COMMENT ON TABLE calendar_resolution_rules IS 'Priority rules for resolving calendar day type conflicts';
COMMENT ON TABLE weekly_off_audit_logs IS 'Complete audit trail of all weekly off related changes';
