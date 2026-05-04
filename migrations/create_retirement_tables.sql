-- ==========================================
-- RETIREMENT MODULE DATABASE MIGRATION
-- Configuration-Driven Retirement Management
-- ==========================================

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS employee_retirements CASCADE;
DROP TABLE IF EXISTS retirement_policies CASCADE;

-- ==========================================
-- RETIREMENT POLICIES TABLE
-- Stores configurable retirement eligibility rules
-- ==========================================
CREATE TABLE retirement_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Policy Identification
    policy_code VARCHAR(50) UNIQUE NOT NULL,
    policy_name VARCHAR(200) NOT NULL,
    description TEXT,
    rule_priority INT NOT NULL DEFAULT 100,
    
    -- Applicability Scope
    country_code VARCHAR(3),
    legal_entity_id UUID,
    employee_type VARCHAR(100),
    employee_sub_type VARCHAR(100),
    grade_band VARCHAR(50),
    contract_type VARCHAR(100),
    gender_applicability VARCHAR(20) DEFAULT 'ALL' CHECK (gender_applicability IN ('ALL', 'MALE_ONLY', 'FEMALE_ONLY', 'NON_BINARY')),
    apply_to_union_members BOOLEAN DEFAULT FALSE,
    union_agreement_reference VARCHAR(100),
    
    -- Eligibility Configuration
    eligibility_criteria VARCHAR(50) NOT NULL DEFAULT 'AGE_ONLY' CHECK (eligibility_criteria IN (
        'AGE_ONLY', 'SERVICE_ONLY', 'AGE_OR_SERVICE', 'AGE_AND_SERVICE', 
        'AGE_PLUS_SERVICE_FORMULA', 'CUSTOM_FORMULA'
    )),
    mandatory_retirement_age INT,
    minimum_retirement_age INT,
    maximum_retirement_age INT,
    minimum_service_years INT,
    minimum_service_months INT,
    custom_eligibility_formula TEXT,
    allow_early_retirement BOOLEAN DEFAULT FALSE,
    early_retirement_age INT,
    early_retirement_min_service INT,
    allow_deferred_retirement BOOLEAN DEFAULT FALSE,
    deferred_retirement_max_age INT,
    deferred_retirement_max_months INT,
    
    -- Trigger Configuration
    trigger_type VARCHAR(50) NOT NULL DEFAULT 'DATE_OF_BIRTH' CHECK (trigger_type IN (
        'DATE_OF_BIRTH', 'DATE_OF_JOINING', 'CONTRACT_END_DATE', 'MANUAL_TRIGGER', 'COMBINED_CRITERIA'
    )),
    advance_notice_months INT,
    advance_notice_days INT,
    auto_status_transition BOOLEAN DEFAULT TRUE,
    allow_manual_override BOOLEAN DEFAULT TRUE,
    require_approval_for_override BOOLEAN DEFAULT FALSE,
    
    -- Notice Period Configuration
    notice_type VARCHAR(50) DEFAULT 'MANDATORY' CHECK (notice_type IN (
        'MANDATORY', 'OPTIONAL', 'NOT_REQUIRED', 'AUTO_ISSUED'
    )),
    notice_period_days INT,
    employer_advance_notification_required BOOLEAN DEFAULT TRUE,
    employer_notification_days INT,
    require_acknowledgment BOOLEAN DEFAULT FALSE,
    auto_issue_notice BOOLEAN DEFAULT TRUE,
    
    -- Post-Retirement Configuration
    post_retirement_employment VARCHAR(50) DEFAULT 'NOT_ALLOWED' CHECK (post_retirement_employment IN (
        'NOT_ALLOWED', 'CONSULTANT_ONLY', 'ADVISORY_ONLY', 'FULL_REHIRE_ALLOWED', 'CONTRACT_BASIS_ONLY'
    )),
    allow_rehire BOOLEAN DEFAULT FALSE,
    rehire_cooling_off_months INT,
    allow_consultant_conversion BOOLEAN DEFAULT FALSE,
    consultant_max_duration_months INT,
    allow_advisory_role BOOLEAN DEFAULT FALSE,
    advisory_max_duration_months INT,
    
    -- Payroll & Benefits Hooks
    gratuity_eligible BOOLEAN DEFAULT TRUE,
    pension_scheme_code VARCHAR(100),
    trigger_final_settlement BOOLEAN DEFAULT TRUE,
    continue_health_benefits BOOLEAN DEFAULT FALSE,
    health_benefits_duration_months INT,
    continue_life_insurance BOOLEAN DEFAULT FALSE,
    life_insurance_duration_months INT,
    additional_benefits_config JSONB,
    
    -- Compliance & Legal
    government_reporting_required BOOLEAN DEFAULT FALSE,
    reporting_authority VARCHAR(100),
    reporting_deadline_days INT,
    work_permit_dependent BOOLEAN DEFAULT FALSE,
    visa_cancellation_required BOOLEAN DEFAULT FALSE,
    visa_grace_period_days INT,
    legal_reference_code VARCHAR(255),
    compliance_notes TEXT,
    
    -- Override & Exception Management
    allow_age_extension BOOLEAN DEFAULT FALSE,
    max_extension_years INT,
    extension_requires_approval BOOLEAN DEFAULT TRUE,
    extension_approval_level VARCHAR(100),
    allow_early_retirement_approval BOOLEAN DEFAULT FALSE,
    require_dual_approval BOOLEAN DEFAULT FALSE,
    mandatory_justification BOOLEAN DEFAULT TRUE,
    override_validity_months INT,
    
    -- Effective Dating & Versioning
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_active BOOLEAN DEFAULT TRUE,
    policy_version INT DEFAULT 1,
    supersedes_policy_id UUID,
    allow_retroactive_application BOOLEAN DEFAULT FALSE,
    
    -- Rule Builder Configuration
    conditional_logic JSONB,
    exception_rules JSONB,
    impact_preview_metadata JSONB,
    
    -- Event Outputs
    trigger_eligibility_event BOOLEAN DEFAULT TRUE,
    trigger_pre_retirement_notification BOOLEAN DEFAULT TRUE,
    trigger_lifecycle_status_change BOOLEAN DEFAULT TRUE,
    trigger_downstream_systems BOOLEAN DEFAULT FALSE,
    downstream_system_config JSONB,
    
    -- Audit & Metadata
    created_by UUID,
    updated_by UUID,
    approved_by UUID,
    approved_at TIMESTAMP,
    approval_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    audit_metadata JSONB
);

-- ==========================================
-- EMPLOYEE RETIREMENTS TABLE
-- Individual retirement case tracking
-- ==========================================
CREATE TABLE employee_retirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Case Identification
    retirement_case_id VARCHAR(50) UNIQUE NOT NULL,
    employee_id UUID NOT NULL,
    policy_id UUID NOT NULL,
    policy_snapshot_version VARCHAR(50),
    
    -- Retirement Type & Status
    retirement_type VARCHAR(50) NOT NULL DEFAULT 'MANDATORY' CHECK (retirement_type IN (
        'MANDATORY', 'EARLY_VOLUNTARY', 'DEFERRED', 'MEDICAL', 'SPECIAL_SCHEME', 'CONTRACTUAL'
    )),
    retirement_status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (retirement_status IN (
        'DRAFT', 'ELIGIBILITY_IDENTIFIED', 'PRE_RETIREMENT_NOTICE_ISSUED', 'NOTICE_ACKNOWLEDGED',
        'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'RETIREMENT_IN_PROGRESS', 'RETIREMENT_COMPLETED',
        'EXTENSION_REQUESTED', 'EXTENSION_APPROVED', 'EXTENSION_REJECTED',
        'EARLY_RETIREMENT_REQUESTED', 'EARLY_RETIREMENT_APPROVED', 'DEFERRED_RETIREMENT',
        'CANCELLED', 'ON_HOLD'
    )),
    retirement_reason TEXT,
    
    -- Eligibility Calculation
    employee_date_of_birth DATE,
    employee_date_of_joining DATE,
    age_at_eligibility INT,
    service_years_at_eligibility INT,
    service_months_at_eligibility INT,
    eligibility_determination_date DATE NOT NULL,
    eligibility_calculation_notes TEXT,
    meets_age_criteria BOOLEAN DEFAULT FALSE,
    meets_service_criteria BOOLEAN DEFAULT FALSE,
    is_eligible BOOLEAN DEFAULT TRUE,
    
    -- Retirement Dates
    expected_retirement_date DATE NOT NULL,
    actual_retirement_date DATE,
    last_working_day DATE,
    notice_issue_date DATE,
    notice_acknowledgment_date DATE,
    employee_notification_date DATE,
    employer_notification_date DATE,
    
    -- Early Retirement
    is_early_retirement BOOLEAN DEFAULT FALSE,
    early_retirement_request_date DATE,
    early_retirement_justification TEXT,
    early_retirement_approval_status VARCHAR(20) DEFAULT 'NOT_REQUIRED' CHECK (early_retirement_approval_status IN (
        'NOT_REQUIRED', 'PENDING', 'APPROVED', 'REJECTED', 'ESCALATED'
    )),
    early_retirement_approved_by UUID,
    early_retirement_approved_at TIMESTAMP,
    
    -- Deferred Retirement
    is_deferred BOOLEAN DEFAULT FALSE,
    deferral_request_date DATE,
    deferred_until_date DATE,
    deferral_duration_months INT,
    deferral_justification TEXT,
    deferral_approval_status VARCHAR(20) DEFAULT 'NOT_REQUIRED',
    deferral_approved_by UUID,
    deferral_approved_at TIMESTAMP,
    
    -- Extension Management
    extension_requested BOOLEAN DEFAULT FALSE,
    extension_months_requested INT,
    extension_request_date DATE,
    extension_justification TEXT,
    extension_approval_status VARCHAR(20) DEFAULT 'NOT_REQUIRED',
    extension_months_approved INT,
    extended_retirement_date DATE,
    extension_approved_by UUID,
    extension_approved_at TIMESTAMP,
    extension_rejection_reason TEXT,
    
    -- Approvals & Workflow
    requires_approval BOOLEAN DEFAULT FALSE,
    primary_approver_id UUID,
    secondary_approver_id UUID,
    primary_approval_date TIMESTAMP,
    secondary_approval_date TIMESTAMP,
    approval_comments TEXT,
    rejection_reason TEXT,
    rejected_by UUID,
    rejected_at TIMESTAMP,
    
    -- Post-Retirement Employment
    rehire_eligible BOOLEAN DEFAULT FALSE,
    rehire_eligible_from DATE,
    consultant_conversion_eligible BOOLEAN DEFAULT FALSE,
    advisory_role_eligible BOOLEAN DEFAULT FALSE,
    post_retirement_employment_start_date DATE,
    post_retirement_employment_type VARCHAR(100),
    
    -- Payroll & Benefits
    gratuity_calculation_triggered BOOLEAN DEFAULT FALSE,
    estimated_gratuity_amount DECIMAL(15, 2),
    pension_scheme_assigned VARCHAR(100),
    final_settlement_triggered BOOLEAN DEFAULT FALSE,
    final_settlement_date DATE,
    health_benefits_continued BOOLEAN DEFAULT FALSE,
    health_benefits_end_date DATE,
    life_insurance_continued BOOLEAN DEFAULT FALSE,
    life_insurance_end_date DATE,
    additional_benefits_snapshot JSONB,
    
    -- Compliance & Reporting
    government_reporting_required BOOLEAN DEFAULT FALSE,
    government_report_submitted BOOLEAN DEFAULT FALSE,
    government_report_submission_date DATE,
    government_report_reference VARCHAR(200),
    work_permit_cancelled BOOLEAN DEFAULT FALSE,
    work_permit_cancellation_date DATE,
    visa_cancelled BOOLEAN DEFAULT FALSE,
    visa_cancellation_date DATE,
    visa_grace_period_end DATE,
    
    -- Override & Exception Tracking
    is_override BOOLEAN DEFAULT FALSE,
    override_justification TEXT,
    override_approved_by UUID,
    override_approved_at TIMESTAMP,
    override_valid_until DATE,
    exception_notes TEXT,
    
    -- Lifecycle Transitions
    previous_employee_status VARCHAR(50),
    new_employee_status VARCHAR(50),
    status_transition_date DATE,
    auto_status_transitioned BOOLEAN DEFAULT FALSE,
    
    -- Event Triggers
    eligibility_event_triggered BOOLEAN DEFAULT FALSE,
    eligibility_event_triggered_at TIMESTAMP,
    pre_retirement_notification_sent BOOLEAN DEFAULT FALSE,
    pre_retirement_notification_sent_at TIMESTAMP,
    lifecycle_event_triggered BOOLEAN DEFAULT FALSE,
    lifecycle_event_triggered_at TIMESTAMP,
    downstream_systems_notified BOOLEAN DEFAULT FALSE,
    downstream_systems_notified_at TIMESTAMP,
    event_log JSONB,
    
    -- Cancellation
    is_cancelled BOOLEAN DEFAULT FALSE,
    cancellation_reason TEXT,
    cancelled_by UUID,
    cancelled_at TIMESTAMP,
    
    -- Audit & Metadata
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    audit_trail JSONB,
    policy_snapshot JSONB,
    internal_notes TEXT,
    employee_comments TEXT,
    hr_comments TEXT,
    
    -- Foreign Keys
    FOREIGN KEY (policy_id) REFERENCES retirement_policies(id) ON DELETE RESTRICT
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Retirement Policies Indexes
CREATE INDEX idx_retirement_policies_country ON retirement_policies(country_code, is_active, effective_from);
CREATE INDEX idx_retirement_policies_legal_entity ON retirement_policies(legal_entity_id, is_active);
CREATE INDEX idx_retirement_policies_priority ON retirement_policies(rule_priority, effective_from);
CREATE INDEX idx_retirement_policies_active ON retirement_policies(is_active);
CREATE INDEX idx_retirement_policies_effective_from ON retirement_policies(effective_from);
CREATE INDEX idx_retirement_policies_policy_code ON retirement_policies(policy_code);

-- Employee Retirements Indexes
CREATE INDEX idx_employee_retirements_employee ON employee_retirements(employee_id, retirement_status);
CREATE INDEX idx_employee_retirements_case_id ON employee_retirements(retirement_case_id);
CREATE INDEX idx_employee_retirements_expected_date ON employee_retirements(expected_retirement_date, retirement_status);
CREATE INDEX idx_employee_retirements_policy ON employee_retirements(policy_id, retirement_status);
CREATE INDEX idx_employee_retirements_status ON employee_retirements(retirement_status);
CREATE INDEX idx_employee_retirements_type ON employee_retirements(retirement_type);
CREATE INDEX idx_employee_retirements_eligibility_date ON employee_retirements(eligibility_determination_date);
CREATE INDEX idx_employee_retirements_created_at ON employee_retirements(created_at);

-- ==========================================
-- COMMENTS FOR DOCUMENTATION
-- ==========================================

COMMENT ON TABLE retirement_policies IS 'Configuration-driven retirement eligibility policies. NO hardcoded values - all rules are admin-configurable.';
COMMENT ON TABLE employee_retirements IS 'Individual employee retirement cases with complete lifecycle tracking and audit trail.';

COMMENT ON COLUMN retirement_policies.eligibility_criteria IS 'Defines how eligibility is calculated: AGE_ONLY, SERVICE_ONLY, AGE_OR_SERVICE, AGE_AND_SERVICE, AGE_PLUS_SERVICE_FORMULA, CUSTOM_FORMULA';
COMMENT ON COLUMN retirement_policies.rule_priority IS 'Lower number = higher priority when multiple policies match. Used for conflict resolution.';
COMMENT ON COLUMN retirement_policies.conditional_logic IS 'JSON configuration for IF/AND/OR rule builder logic';
COMMENT ON COLUMN retirement_policies.policy_snapshot IS 'Complete policy state at the time of application to employee - ensures consistency';

COMMENT ON COLUMN employee_retirements.retirement_case_id IS 'Human-readable case ID format: RET-YYYY-####';
COMMENT ON COLUMN employee_retirements.policy_snapshot IS 'Immutable snapshot of the policy at time of retirement case creation';
COMMENT ON COLUMN employee_retirements.audit_trail IS 'Complete audit log of all changes to the retirement case';
COMMENT ON COLUMN employee_retirements.event_log IS 'Log of all system events triggered by this retirement case';

-- ==========================================
-- SAMPLE CONFIGURATION DATA (OPTIONAL)
-- Uncomment to insert sample policies
-- ==========================================

/*
-- Sample: UAE Mandatory Retirement Policy
INSERT INTO retirement_policies (
    policy_code, policy_name, description,
    country_code, eligibility_criteria,
    mandatory_retirement_age, minimum_retirement_age,
    trigger_type, advance_notice_months,
    gratuity_eligible, pension_scheme_code,
    government_reporting_required, visa_cancellation_required,
    effective_from, is_active
) VALUES (
    'RET-UAE-001',
    'UAE Standard Retirement - Private Sector',
    'Standard mandatory retirement policy for UAE private sector employees as per Labor Law',
    'UAE',
    'AGE_ONLY',
    60, 55,
    'DATE_OF_BIRTH',
    3,
    TRUE, 'UAE_GRATUITY',
    TRUE, TRUE,
    '2024-01-01',
    TRUE
);

-- Sample: USA Flexible Retirement Policy
INSERT INTO retirement_policies (
    policy_code, policy_name, description,
    country_code, eligibility_criteria,
    minimum_retirement_age, allow_early_retirement,
    early_retirement_age, early_retirement_min_service,
    allow_deferred_retirement, deferred_retirement_max_age,
    pension_scheme_code, continue_health_benefits,
    health_benefits_duration_months,
    effective_from, is_active
) VALUES (
    'RET-USA-001',
    'US Flexible Retirement Plan',
    'Age-flexible retirement with early and deferred options',
    'USA',
    'AGE_OR_SERVICE',
    65, TRUE,
    55, 30,
    TRUE, 70,
    'USA_401K', TRUE,
    18,
    '2024-01-01',
    TRUE
);
*/

-- ==========================================
-- END OF MIGRATION
-- ==========================================
