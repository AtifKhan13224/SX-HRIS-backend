-- =====================================================
-- SEPARATION REASONS CONFIGURATION SCHEMA
-- Configuration-Only: No Employee Data
-- Purpose: Define separation categories and reasons for policy management
-- =====================================================

-- ==================== CATEGORIES TABLE ====================

CREATE TABLE IF NOT EXISTS separation_reason_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Tenant Scope
    tenant_id UUID NOT NULL,
    company_id UUID,
    
    -- Category Identity
    category_code VARCHAR(50) NOT NULL UNIQUE,
    category_name VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Display & Ordering
    display_order INTEGER DEFAULT 0,
    icon_name VARCHAR(50),
    color_code VARCHAR(50),
    
    -- Classification
    is_voluntary BOOLEAN DEFAULT TRUE,
    is_involuntary BOOLEAN DEFAULT FALSE,
    is_mutual BOOLEAN DEFAULT FALSE,
    is_retirement BOOLEAN DEFAULT FALSE,
    is_contract_end BOOLEAN DEFAULT FALSE,
    is_death BOOLEAN DEFAULT FALSE,
    
    -- Legal & Compliance
    requires_legal_review BOOLEAN DEFAULT FALSE,
    requires_government_reporting BOOLEAN DEFAULT FALSE,
    is_disciplinary BOOLEAN DEFAULT FALSE,
    is_sensitive BOOLEAN DEFAULT FALSE,
    
    -- Policy Defaults (inherited by reasons)
    default_notice_required BOOLEAN DEFAULT TRUE,
    default_gratuity_eligible BOOLEAN DEFAULT TRUE,
    default_rehire_eligible BOOLEAN DEFAULT TRUE,
    default_final_settlement_eligible BOOLEAN DEFAULT TRUE,
    
    -- Workflow Triggers
    triggers_clearance_process BOOLEAN DEFAULT TRUE,
    triggers_asset_recovery BOOLEAN DEFAULT TRUE,
    triggers_access_deactivation BOOLEAN DEFAULT TRUE,
    triggers_legal_workflow BOOLEAN DEFAULT FALSE,
    
    -- Analytics & Reporting
    attrition_type VARCHAR(50), -- 'Regretted', 'Non-Regretted', 'Neutral'
    risk_indicator VARCHAR(50), -- 'High', 'Medium', 'Low', 'None'
    exclude_from_attrition_rate BOOLEAN DEFAULT FALSE,
    
    -- Visibility & Access
    hr_only BOOLEAN DEFAULT FALSE,
    manager_visible BOOLEAN DEFAULT TRUE,
    employee_self_service_allowed BOOLEAN DEFAULT FALSE,
    mask_in_employee_view BOOLEAN DEFAULT FALSE,
    
    -- Governance
    requires_dual_approval BOOLEAN DEFAULT FALSE,
    requires_mandatory_justification BOOLEAN DEFAULT FALSE,
    allow_manual_override BOOLEAN DEFAULT FALSE,
    audit_flag BOOLEAN DEFAULT TRUE,
    
    -- Effective Dating
    effective_from DATE NOT NULL,
    effective_to DATE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_system_defined BOOLEAN DEFAULT FALSE,
    deactivation_reason VARCHAR(100),
    deactivated_at TIMESTAMP,
    deactivated_by UUID,
    
    -- Metadata
    metadata JSONB,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== REASONS TABLE ====================

CREATE TABLE IF NOT EXISTS separation_reasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Tenant Scope
    tenant_id UUID NOT NULL,
    company_id UUID,
    legal_entity_id UUID,
    
    -- Reason Identity
    reason_code VARCHAR(50) NOT NULL UNIQUE,
    reason_name VARCHAR(200) NOT NULL,
    description TEXT,
    internal_notes TEXT,
    
    -- Category Linkage
    category_id UUID NOT NULL REFERENCES separation_reason_categories(id) ON DELETE RESTRICT,
    
    -- Display & Ordering
    display_order INTEGER DEFAULT 0,
    icon_name VARCHAR(50),
    color_code VARCHAR(50),
    
    -- Policy Control Flags
    notice_period_required BOOLEAN DEFAULT TRUE,
    minimum_notice_days INTEGER,
    eligible_for_gratuity BOOLEAN DEFAULT TRUE,
    eligible_for_final_settlement BOOLEAN DEFAULT TRUE,
    eligible_for_rehire BOOLEAN DEFAULT TRUE,
    rehire_waiting_period_months INTEGER,
    eligible_for_exit_interview BOOLEAN DEFAULT FALSE,
    requires_clearance_certificate BOOLEAN DEFAULT FALSE,
    
    -- Legal & Compliance
    government_reporting_required BOOLEAN DEFAULT FALSE,
    government_reporting_code VARCHAR(100),
    is_disciplinary BOOLEAN DEFAULT FALSE,
    requires_legal_review BOOLEAN DEFAULT FALSE,
    labor_law_reference TEXT,
    is_protected_termination BOOLEAN DEFAULT FALSE,
    
    -- Country & Legal Context
    applicable_country_code VARCHAR(10),
    applicable_countries JSONB,
    union_applicable BOOLEAN DEFAULT FALSE,
    cba_applicable BOOLEAN DEFAULT FALSE,
    cba_reference VARCHAR(200),
    
    -- Workflow Impact Mapping
    triggers_clearance_process BOOLEAN DEFAULT TRUE,
    triggers_payroll_settlement BOOLEAN DEFAULT TRUE,
    triggers_asset_recovery BOOLEAN DEFAULT TRUE,
    triggers_access_deactivation BOOLEAN DEFAULT TRUE,
    triggers_legal_workflow BOOLEAN DEFAULT FALSE,
    triggers_investigation_workflow BOOLEAN DEFAULT FALSE,
    custom_workflow_triggers JSONB,
    
    -- Visibility & Security
    hr_only BOOLEAN DEFAULT FALSE,
    manager_visible BOOLEAN DEFAULT TRUE,
    employee_self_service_allowed BOOLEAN DEFAULT FALSE,
    mask_in_employee_view BOOLEAN DEFAULT FALSE,
    masked_display_name VARCHAR(200),
    
    -- Analytics & Reporting Tags
    attrition_type VARCHAR(50),
    voluntary_classification VARCHAR(50),
    risk_indicator VARCHAR(50),
    compliance_sensitivity_flag BOOLEAN DEFAULT FALSE,
    exclude_from_attrition_metrics BOOLEAN DEFAULT FALSE,
    counts_as_turnover BOOLEAN DEFAULT TRUE,
    analytics_tags JSONB,
    
    -- Override & Governance
    allow_manual_override BOOLEAN DEFAULT FALSE,
    requires_dual_approval BOOLEAN DEFAULT FALSE,
    approval_authority_level VARCHAR(100),
    mandatory_justification_required BOOLEAN DEFAULT FALSE,
    minimum_justification_length INTEGER,
    override_audit_flag BOOLEAN DEFAULT TRUE,
    required_documents JSONB,
    
    -- Financial Impact
    affects_severance_calculation BOOLEAN DEFAULT FALSE,
    severance_multiplier DECIMAL(5,2),
    affects_notice_pay_calculation BOOLEAN DEFAULT FALSE,
    payroll_impact_code VARCHAR(100),
    
    -- Effective Dating & Versioning
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_historical BOOLEAN DEFAULT FALSE,
    superseded_by UUID,
    supersedes UUID,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_system_defined BOOLEAN DEFAULT FALSE,
    deactivation_reason VARCHAR(100),
    deactivated_at TIMESTAMP,
    deactivated_by UUID,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,
    
    -- Validation Rules
    validation_rules JSONB,
    requires_manager_confirmation BOOLEAN DEFAULT FALSE,
    requires_employee_acknowledgment BOOLEAN DEFAULT FALSE,
    
    -- Integration
    external_system_code VARCHAR(100),
    integration_mapping JSONB,
    
    -- Metadata
    metadata JSONB,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== INDEXES ====================

-- Category Indexes
CREATE INDEX idx_sep_cat_tenant ON separation_reason_categories(tenant_id);
CREATE INDEX idx_sep_cat_company ON separation_reason_categories(company_id);
CREATE INDEX idx_sep_cat_code ON separation_reason_categories(category_code);
CREATE INDEX idx_sep_cat_active ON separation_reason_categories(is_active);
CREATE INDEX idx_sep_cat_display ON separation_reason_categories(display_order);
CREATE INDEX idx_sep_cat_effective ON separation_reason_categories(effective_from, effective_to);
CREATE INDEX idx_sep_cat_classification ON separation_reason_categories(is_voluntary, is_involuntary, is_mutual);

-- Reason Indexes
CREATE INDEX idx_sep_reason_tenant ON separation_reasons(tenant_id);
CREATE INDEX idx_sep_reason_company ON separation_reasons(company_id);
CREATE INDEX idx_sep_reason_legal_entity ON separation_reasons(legal_entity_id);
CREATE INDEX idx_sep_reason_code ON separation_reasons(reason_code);
CREATE INDEX idx_sep_reason_category ON separation_reasons(category_id);
CREATE INDEX idx_sep_reason_active ON separation_reasons(is_active);
CREATE INDEX idx_sep_reason_display ON separation_reasons(display_order);
CREATE INDEX idx_sep_reason_effective ON separation_reasons(effective_from, effective_to);
CREATE INDEX idx_sep_reason_country ON separation_reasons(applicable_country_code);
CREATE INDEX idx_sep_reason_classification ON separation_reasons(voluntary_classification);
CREATE INDEX idx_sep_reason_visibility ON separation_reasons(hr_only, manager_visible, employee_self_service_allowed);
CREATE INDEX idx_sep_reason_usage ON separation_reasons(usage_count DESC);
CREATE INDEX idx_sep_reason_last_used ON separation_reasons(last_used_at);

-- Composite Indexes for common queries
CREATE INDEX idx_sep_cat_tenant_active ON separation_reason_categories(tenant_id, is_active);
CREATE INDEX idx_sep_reason_tenant_active ON separation_reasons(tenant_id, is_active);
CREATE INDEX idx_sep_reason_cat_active ON separation_reasons(category_id, is_active);

-- JSONB Indexes for filtering
CREATE INDEX idx_sep_reason_countries ON separation_reasons USING GIN(applicable_countries);
CREATE INDEX idx_sep_reason_analytics_tags ON separation_reasons USING GIN(analytics_tags);
CREATE INDEX idx_sep_reason_workflows ON separation_reasons USING GIN(custom_workflow_triggers);

-- ==================== COMMENTS ====================

COMMENT ON TABLE separation_reason_categories IS 'Configuration: Separation reason categories (no employee data)';
COMMENT ON TABLE separation_reasons IS 'Configuration: Separation reasons (no employee transactions)';

COMMENT ON COLUMN separation_reason_categories.is_voluntary IS 'Employee-initiated separations';
COMMENT ON COLUMN separation_reason_categories.is_involuntary IS 'Employer-initiated terminations';
COMMENT ON COLUMN separation_reason_categories.is_mutual IS 'Mutual agreement separations';
COMMENT ON COLUMN separation_reason_categories.exclude_from_attrition_rate IS 'e.g., retirement, death - excluded from turnover metrics';

COMMENT ON COLUMN separation_reasons.usage_count IS 'Transactional count - NOT stored employee records';
COMMENT ON COLUMN separation_reasons.is_historical IS 'Retired but kept for historical consistency';
COMMENT ON COLUMN separation_reasons.superseded_by IS 'Points to replacement reason if policy changed';
COMMENT ON COLUMN separation_reasons.masked_display_name IS 'What employee sees if reason is masked';
COMMENT ON COLUMN separation_reasons.government_reporting_code IS 'Official code for labor department reports';
COMMENT ON COLUMN separation_reasons.labor_law_reference IS 'e.g., UAE Labor Law Article 44';

-- ==================== CONSTRAINTS ====================

-- Ensure tenant scoping
ALTER TABLE separation_reason_categories ADD CONSTRAINT chk_sep_cat_tenant_not_null CHECK (tenant_id IS NOT NULL);
ALTER TABLE separation_reasons ADD CONSTRAINT chk_sep_reason_tenant_not_null CHECK (tenant_id IS NOT NULL);

-- Ensure effective date logic
ALTER TABLE separation_reason_categories ADD CONSTRAINT chk_sep_cat_effective_dates 
    CHECK (effective_to IS NULL OR effective_to >= effective_from);
ALTER TABLE separation_reasons ADD CONSTRAINT chk_sep_reason_effective_dates 
    CHECK (effective_to IS NULL OR effective_to >= effective_from);

-- Ensure notice period logic
ALTER TABLE separation_reasons ADD CONSTRAINT chk_sep_reason_notice_days 
    CHECK (minimum_notice_days IS NULL OR minimum_notice_days >= 0);

-- Ensure rehire waiting period logic
ALTER TABLE separation_reasons ADD CONSTRAINT chk_sep_reason_rehire_period 
    CHECK (rehire_waiting_period_months IS NULL OR rehire_waiting_period_months >= 0);

-- Ensure usage count is non-negative
ALTER TABLE separation_reasons ADD CONSTRAINT chk_sep_reason_usage_count 
    CHECK (usage_count >= 0);

-- ==================== SAMPLE DATA (STARTER TEMPLATES) ====================

-- Insert starter categories (these are examples, fully configurable)
INSERT INTO separation_reason_categories (
    tenant_id, category_code, category_name, description,
    is_voluntary, is_involuntary, is_mutual, is_retirement,
    display_order, color_code, effective_from, is_system_defined
) VALUES
    ('00000000-0000-0000-0000-000000000000', 'VOL', 'Voluntary Separation', 'Employee-initiated resignations', true, false, false, false, 1, '#10B981', CURRENT_DATE, false),
    ('00000000-0000-0000-0000-000000000000', 'INVOL', 'Involuntary Termination', 'Employer-initiated terminations', false, true, false, false, 2, '#EF4444', CURRENT_DATE, false),
    ('00000000-0000-0000-0000-000000000000', 'MUTUAL', 'Mutual Separation', 'Separation by mutual agreement', false, false, true, false, 3, '#F59E0B', CURRENT_DATE, false),
    ('00000000-0000-0000-0000-000000000000', 'RETIRE', 'Retirement', 'Natural retirement', false, false, false, true, 4, '#8B5CF6', CURRENT_DATE, false),
    ('00000000-0000-0000-0000-000000000000', 'EOC', 'End of Contract', 'Contract expiry', false, false, false, false, 5, '#6B7280', CURRENT_DATE, false),
    ('00000000-0000-0000-0000-000000000000', 'DIS', 'Death in Service', 'Death while employed', false, false, false, false, 6, '#000000', CURRENT_DATE, false)
ON CONFLICT (category_code) DO NOTHING;

-- Note: Actual separation reasons are tenant-specific and should be created via API
-- These are just templates to demonstrate structure

COMMENT ON TABLE separation_reason_categories IS 'CONFIGURATION ONLY: No employee transactions stored';
COMMENT ON TABLE separation_reasons IS 'CONFIGURATION ONLY: Policy-driven reason definitions';
