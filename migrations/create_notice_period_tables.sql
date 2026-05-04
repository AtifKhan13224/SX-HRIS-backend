-- Notice Period Management Tables Migration
-- Created: 2024-01-15
-- Description: Creates tables for notice period policies and employee separations

-- Drop existing tables if they exist
DROP TABLE IF EXISTS employee_separations CASCADE;
DROP TABLE IF EXISTS notice_period_policies CASCADE;

-- Create Notice Period Policies table
CREATE TABLE notice_period_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    policy_code VARCHAR(50) NOT NULL UNIQUE,
    policy_name VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Hierarchy Filters
    country_id UUID,
    legal_entity_id UUID,
    employee_type_id UUID,
    employee_subtype_id UUID,
    grade_id UUID,
    band_id UUID,
    contract_type_id UUID,
    applies_to_probation BOOLEAN DEFAULT FALSE,
    
    -- Separation Types (JSONB array)
    applicable_separation_types JSONB NOT NULL,
    separation_initiator VARCHAR(50),
    
    -- Core Notice Period Configuration
    standard_notice_days INTEGER NOT NULL,
    notice_day_type VARCHAR(20) DEFAULT 'CALENDAR',
    minimum_legal_notice_days INTEGER NOT NULL,
    maximum_notice_days INTEGER,
    
    -- Probation-Specific Rules
    probation_notice_days INTEGER,
    probation_immediate_termination_allowed BOOLEAN DEFAULT FALSE,
    
    -- Employer vs Employee Notice
    employer_notice_days INTEGER,
    employee_notice_days INTEGER,
    
    -- Buyout & Pay-in-Lieu (PILON)
    employee_buyout_allowed BOOLEAN DEFAULT FALSE,
    employer_pilon_allowed BOOLEAN DEFAULT TRUE,
    partial_buyout_allowed BOOLEAN DEFAULT FALSE,
    buyout_multiplier DECIMAL(5, 2),
    
    -- Leave During Notice
    leave_allowed_during_notice BOOLEAN DEFAULT TRUE,
    force_leave_utilization BOOLEAN DEFAULT FALSE,
    include_holidays_in_notice BOOLEAN DEFAULT TRUE,
    unpaid_leave_allowed BOOLEAN DEFAULT FALSE,
    attendance_required_during_notice BOOLEAN DEFAULT TRUE,
    
    -- Override & Approval Rules
    override_requires_approval BOOLEAN DEFAULT TRUE,
    override_approvers JSONB,
    override_requires_justification BOOLEAN DEFAULT TRUE,
    
    -- Country Law Enforcement
    country_law_overrides_policy BOOLEAN DEFAULT TRUE,
    country_law_reference JSONB,
    
    -- Visa/Work Permit Dependencies
    visa_dependent BOOLEAN DEFAULT FALSE,
    visa_cancellation_notice_days INTEGER,
    
    -- Government Reporting
    requires_ministry_notification BOOLEAN DEFAULT FALSE,
    ministry_notification_days_before INTEGER,
    
    -- Cross-Module Integration Flags
    trigger_payroll_settlement BOOLEAN DEFAULT TRUE,
    trigger_gratuity_calculation BOOLEAN DEFAULT TRUE,
    trigger_leave_encashment BOOLEAN DEFAULT TRUE,
    trigger_access_deactivation BOOLEAN DEFAULT TRUE,
    trigger_asset_recovery BOOLEAN DEFAULT TRUE,
    
    -- Priority & Effective Dating
    rule_priority INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    effective_from DATE NOT NULL,
    effective_to DATE,
    
    -- Audit Fields
    created_by UUID NOT NULL,
    updated_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Create Employee Separations table
CREATE TABLE employee_separations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    separation_case_id VARCHAR(50) NOT NULL UNIQUE,
    employee_id UUID NOT NULL,
    
    -- Separation Details
    separation_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT',
    separation_reason TEXT,
    submission_date DATE NOT NULL,
    applied_policy_id UUID,
    
    -- Notice Period Calculation
    notice_days_required INTEGER NOT NULL,
    notice_day_type VARCHAR(20) NOT NULL,
    notice_start_date DATE NOT NULL,
    notice_end_date DATE NOT NULL,
    last_working_day DATE NOT NULL,
    
    -- Leave & Attendance During Notice
    leave_balance_at_notice DECIMAL(10, 2) DEFAULT 0,
    leave_adjusted_days INTEGER DEFAULT 0,
    forced_leave_days INTEGER DEFAULT 0,
    unpaid_leave_days INTEGER DEFAULT 0,
    attendance_during_notice INTEGER DEFAULT 0,
    attendance_required BOOLEAN DEFAULT TRUE,
    
    -- Buyout/PILON
    buyout_requested BOOLEAN DEFAULT FALSE,
    buyout_approved BOOLEAN DEFAULT FALSE,
    buyout_amount DECIMAL(12, 2),
    pilon_amount DECIMAL(12, 2),
    buyout_tax_treatment VARCHAR(50),
    
    -- Override Details
    override_applied BOOLEAN DEFAULT FALSE,
    override_reason TEXT,
    override_approved_by UUID,
    override_approved_at TIMESTAMP,
    override_notice_days INTEGER,
    
    -- Compliance & Legal
    country_law_compliant BOOLEAN DEFAULT TRUE,
    compliance_checks JSONB,
    ministry_notification_status VARCHAR(50),
    ministry_notification_sent_at TIMESTAMP,
    ministry_notification_reference VARCHAR(100),
    
    -- Financial Settlement
    payroll_settlement_amount DECIMAL(15, 2),
    gratuity_amount DECIMAL(15, 2),
    leave_encashment_amount DECIMAL(12, 2),
    other_dues DECIMAL(12, 2),
    deductions DECIMAL(12, 2),
    net_settlement_amount DECIMAL(15, 2),
    settlement_payment_date DATE,
    
    -- Asset & Access Management
    assets_returned BOOLEAN DEFAULT FALSE,
    asset_recovery_completed_at TIMESTAMP,
    access_deactivated BOOLEAN DEFAULT FALSE,
    access_deactivated_at TIMESTAMP,
    
    -- Visa & Immigration
    visa_cancelled BOOLEAN DEFAULT FALSE,
    visa_cancelled_at TIMESTAMP,
    visa_cancellation_due_date DATE,
    
    -- Withdrawal & Absconding
    withdrawal_requested BOOLEAN DEFAULT FALSE,
    withdrawal_requested_at TIMESTAMP,
    withdrawal_approved BOOLEAN DEFAULT FALSE,
    withdrawal_approved_by UUID,
    absconded BOOLEAN DEFAULT FALSE,
    absconding_declared_at DATE,
    
    -- Legal Hold
    legal_hold_active BOOLEAN DEFAULT FALSE,
    legal_hold_reason TEXT,
    legal_hold_applied_at DATE,
    
    -- Cross-Country Transfer
    cross_country_transfer_id UUID,
    is_transfer_separation BOOLEAN DEFAULT FALSE,
    
    -- Workflow State
    current_workflow_step VARCHAR(50),
    current_approver_id UUID,
    workflow_history JSONB,
    
    -- Approvals
    immediate_manager_id UUID,
    manager_approved BOOLEAN DEFAULT FALSE,
    manager_approved_at TIMESTAMP,
    hr_approver_id UUID,
    hr_approved BOOLEAN DEFAULT FALSE,
    hr_approved_at TIMESTAMP,
    final_approver_id UUID,
    final_approved BOOLEAN DEFAULT FALSE,
    final_approved_at TIMESTAMP,
    
    -- Audit Fields
    created_by UUID NOT NULL,
    updated_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB,
    remarks TEXT
);

-- Create indexes for better query performance

-- Notice Period Policies indexes
CREATE INDEX idx_notice_policies_tenant ON notice_period_policies(tenant_id);
CREATE INDEX idx_notice_policies_tenant_active_effective ON notice_period_policies(tenant_id, is_active, effective_from);
CREATE INDEX idx_notice_policies_country ON notice_period_policies(country_id, is_active);
CREATE INDEX idx_notice_policies_policy_code ON notice_period_policies(policy_code);

-- Employee Separations indexes
CREATE INDEX idx_separations_tenant ON employee_separations(tenant_id);
CREATE INDEX idx_separations_tenant_employee ON employee_separations(tenant_id, employee_id);
CREATE INDEX idx_separations_case_id ON employee_separations(separation_case_id);
CREATE INDEX idx_separations_status_lwd ON employee_separations(status, last_working_day);
CREATE INDEX idx_separations_employee ON employee_separations(employee_id);
CREATE INDEX idx_separations_status ON employee_separations(status);
CREATE INDEX idx_separations_submission_date ON employee_separations(submission_date);

-- Foreign key constraints (optional - comment out if related tables don't exist yet)
-- ALTER TABLE notice_period_policies 
--     ADD CONSTRAINT fk_notice_policies_country 
--     FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL;

-- ALTER TABLE employee_separations 
--     ADD CONSTRAINT fk_separations_policy 
--     FOREIGN KEY (applied_policy_id) REFERENCES notice_period_policies(id) ON DELETE SET NULL;

-- Grants (adjust based on your user roles)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON notice_period_policies TO hris_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON employee_separations TO hris_app_user;

-- Add comments for documentation
COMMENT ON TABLE notice_period_policies IS 'Stores notice period policy rules with hierarchy and compliance settings';
COMMENT ON TABLE employee_separations IS 'Tracks employee separation cases with workflow and settlement details';

COMMENT ON COLUMN notice_period_policies.applicable_separation_types IS 'JSONB array of separation types this policy applies to';
COMMENT ON COLUMN notice_period_policies.country_law_reference IS 'JSONB object with country law details (law_name, article_number, minimum_notice_days, special_conditions)';
COMMENT ON COLUMN employee_separations.compliance_checks IS 'JSONB object tracking various compliance checkpoints';
COMMENT ON COLUMN employee_separations.workflow_history IS 'JSONB array of workflow actions with timestamps and actors';
