-- =====================================================
-- PHASE 1: ENTERPRISE AUTHENTICATION INFRASTRUCTURE
-- Migration: Create 23 new authentication tables
-- Date: April 29, 2026
-- Impact: Enables MFA, Session Management, Security Features
-- =====================================================

-- =====================================================
-- STEP 1: ENHANCE EXISTING USERS TABLE
-- Add new columns for MFA, security, SSO
-- =====================================================

ALTER TABLE users
    -- MFA Fields
    ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS mfa_method VARCHAR(50),
    ADD COLUMN IF NOT EXISTS mfa_secret TEXT,
    ADD COLUMN IF NOT EXISTS mfa_phone VARCHAR(20),
    ADD COLUMN IF NOT EXISTS mfa_backup_codes_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS mfa_last_verified_at TIMESTAMP,
    
    -- Password Policy Fields
    ADD COLUMN IF NOT EXISTS password_last_changed_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS password_expires_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS password_never_expires BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false,
    
    -- Account Security
    ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS account_locked_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP,
    ADD COLUMN IF NOT EXISTS lockout_reason VARCHAR(255),
    
    -- SSO Fields
    ADD COLUMN IF NOT EXISTS sso_provider VARCHAR(100),
    ADD COLUMN IF NOT EXISTS sso_external_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS sso_metadata JSONB,
    
    -- Security Settings
    ADD COLUMN IF NOT EXISTS require_mfa BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS allowed_ip_addresses TEXT[],
    ADD COLUMN IF NOT EXISTS geofence_enabled BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS max_concurrent_sessions INTEGER DEFAULT 3,
    ADD COLUMN IF NOT EXISTS session_timeout_minutes INTEGER DEFAULT 480,
    
    -- Privacy & Compliance
    ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS privacy_policy_accepted_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP,
    
    -- Enhanced Audit Fields
    ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(45),
    ADD COLUMN IF NOT EXISTS last_login_device TEXT,
    ADD COLUMN IF NOT EXISTS last_login_location VARCHAR(255),
    ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Add constraints to users table
ALTER TABLE users
    ADD CONSTRAINT IF NOT EXISTS chk_mfa_method 
        CHECK (mfa_method IS NULL OR mfa_method IN ('totp', 'sms', 'email', 'biometric', 'hardware_token')),
    ADD CONSTRAINT IF NOT EXISTS chk_user_status 
        CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'LOCKED', 'PENDING_VERIFICATION'));

-- Add indexes for enhanced users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_sso_provider ON users(sso_provider, sso_external_id);
CREATE INDEX IF NOT EXISTS idx_users_status_active ON users(status) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_users_mfa_enabled ON users(mfa_enabled);
CREATE INDEX IF NOT EXISTS idx_users_locked ON users(account_locked_until) WHERE account_locked_at IS NOT NULL;

-- =====================================================
-- STEP 2: CREATE NEW AUTHENTICATION TABLES
-- =====================================================

-- TABLE 1: user_mfa_settings
CREATE TABLE IF NOT EXISTS user_mfa_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    method VARCHAR(50) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    totp_secret TEXT,
    phone_number VARCHAR(20),
    email_address VARCHAR(255),
    device_id TEXT,
    device_name VARCHAR(255),
    last_used_at TIMESTAMP,
    verified_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_mfa_settings_method CHECK (method IN ('totp', 'sms', 'email', 'biometric', 'hardware_token')),
    UNIQUE(user_id, method, device_id)
);

CREATE INDEX idx_mfa_user ON user_mfa_settings(user_id);
CREATE INDEX idx_mfa_active ON user_mfa_settings(user_id) WHERE is_active = true;

COMMENT ON TABLE user_mfa_settings IS 'Stores user MFA configuration for multiple methods';

-- TABLE 2: mfa_backup_codes
CREATE TABLE IF NOT EXISTS mfa_backup_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_hash VARCHAR(255) NOT NULL,
    used_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_code_not_used CHECK (used_at IS NULL OR used_at <= CURRENT_TIMESTAMP)
);

CREATE INDEX idx_backup_codes_user ON mfa_backup_codes(user_id);
CREATE INDEX idx_backup_codes_unused ON mfa_backup_codes(user_id) WHERE used_at IS NULL;

COMMENT ON TABLE mfa_backup_codes IS 'One-time backup codes for MFA recovery';

-- TABLE 3: user_sessions (Enhanced)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(500) NOT NULL UNIQUE,
    refresh_token VARCHAR(500),
    access_token VARCHAR(500),
    
    -- Device Information
    device_id TEXT NOT NULL,
    device_name VARCHAR(255),
    device_type VARCHAR(50),
    os_name VARCHAR(100),
    os_version VARCHAR(50),
    browser_name VARCHAR(100),
    browser_version VARCHAR(50),
    device_fingerprint TEXT,
    
    -- Network Information
    ip_address VARCHAR(45),
    ip_country VARCHAR(100),
    ip_city VARCHAR(255),
    ip_timezone VARCHAR(100),
    user_agent TEXT,
    
    -- Session Status
    is_active BOOLEAN DEFAULT true,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    terminated_at TIMESTAMP,
    termination_reason VARCHAR(255),
    
    -- Security Flags
    mfa_verified BOOLEAN DEFAULT false,
    risk_score INTEGER DEFAULT 0,
    is_suspicious BOOLEAN DEFAULT false,
    trust_score INTEGER DEFAULT 50,
    
    CONSTRAINT chk_device_type CHECK (device_type IS NULL OR device_type IN ('desktop', 'mobile', 'tablet', 'unknown')),
    CONSTRAINT chk_risk_score CHECK (risk_score BETWEEN 0 AND 100),
    CONSTRAINT chk_trust_score CHECK (trust_score BETWEEN 0 AND 100)
);

CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_sessions_active ON user_sessions(user_id) WHERE is_active = true;
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_device ON user_sessions(device_id);
CREATE INDEX idx_sessions_expiry ON user_sessions(expires_at);

COMMENT ON TABLE user_sessions IS 'Enhanced session tracking with device and security information';

-- TABLE 4: user_devices
CREATE TABLE IF NOT EXISTS user_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    device_name VARCHAR(255),
    device_type VARCHAR(50),
    
    -- Device Details
    os_name VARCHAR(100),
    os_version VARCHAR(50),
    browser_name VARCHAR(100),
    browser_version VARCHAR(50),
    device_fingerprint TEXT,
    
    -- Trust & Security
    is_trusted BOOLEAN DEFAULT false,
    trust_score INTEGER DEFAULT 0,
    trusted_at TIMESTAMP,
    last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_ip VARCHAR(45),
    last_location VARCHAR(255),
    
    -- Device Status
    is_active BOOLEAN DEFAULT true,
    is_blocked BOOLEAN DEFAULT false,
    blocked_reason VARCHAR(255),
    blocked_at TIMESTAMP,
    
    -- Metadata
    first_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_logins INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_device_trust_score CHECK (trust_score BETWEEN 0 AND 100),
    UNIQUE(user_id, device_id)
);

CREATE INDEX idx_devices_user ON user_devices(user_id);
CREATE INDEX idx_devices_trusted ON user_devices(user_id) WHERE is_trusted = true;
CREATE INDEX idx_devices_active ON user_devices(user_id) WHERE is_active = true;

COMMENT ON TABLE user_devices IS 'Tracks and manages user devices for security';

-- TABLE 5: login_attempts
CREATE TABLE IF NOT EXISTS login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    
    -- Attempt Details
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(255),
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Device & Network
    ip_address VARCHAR(45),
    ip_country VARCHAR(100),
    ip_city VARCHAR(255),
    user_agent TEXT,
    device_id TEXT,
    device_fingerprint TEXT,
    
    -- Security Analysis
    risk_score INTEGER DEFAULT 0,
    is_suspicious BOOLEAN DEFAULT false,
    blocked_by_rule VARCHAR(255),
    
    -- MFA Status
    mfa_required BOOLEAN DEFAULT false,
    mfa_verified BOOLEAN DEFAULT false,
    mfa_method VARCHAR(50),
    
    CONSTRAINT chk_login_risk_score CHECK (risk_score BETWEEN 0 AND 100)
);

CREATE INDEX idx_login_attempts_user ON login_attempts(user_id);
CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX idx_login_attempts_time ON login_attempts(attempted_at DESC);
CREATE INDEX idx_login_attempts_failed ON login_attempts(user_id, success) WHERE success = false;

COMMENT ON TABLE login_attempts IS 'Comprehensive log of all login attempts for security analysis';

-- TABLE 6: account_lockouts
CREATE TABLE IF NOT EXISTS account_lockouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Lockout Details
    locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    locked_until TIMESTAMP NOT NULL,
    reason VARCHAR(255) NOT NULL,
    trigger_type VARCHAR(100),
    
    -- Context
    failed_attempts_count INTEGER,
    triggering_ip VARCHAR(45),
    triggering_event TEXT,
    
    -- Resolution
    unlocked_at TIMESTAMP,
    unlocked_by UUID REFERENCES users(id),
    unlock_method VARCHAR(100),
    unlock_reason TEXT,
    
    is_active BOOLEAN DEFAULT true,
    
    CONSTRAINT chk_trigger_type CHECK (trigger_type IS NULL OR trigger_type IN ('failed_attempts', 'suspicious_activity', 'manual', 'compliance')),
    CONSTRAINT chk_unlock_method CHECK (unlock_method IS NULL OR unlock_method IN ('auto_expire', 'admin_unlock', 'password_reset', 'support_ticket'))
);

CREATE INDEX idx_lockouts_user ON account_lockouts(user_id);
CREATE INDEX idx_lockouts_active ON account_lockouts(user_id) WHERE is_active = true;
CREATE INDEX idx_lockouts_time ON account_lockouts(locked_until);

COMMENT ON TABLE account_lockouts IS 'Account lockout history for security incidents';

-- TABLE 7: password_history
CREATE TABLE IF NOT EXISTS password_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by UUID REFERENCES users(id),
    change_reason VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    CONSTRAINT chk_change_reason CHECK (change_reason IS NULL OR change_reason IN ('manual', 'expired', 'reset', 'compromised', 'policy'))
);

CREATE INDEX idx_password_history_user ON password_history(user_id);
CREATE INDEX idx_password_history_time ON password_history(changed_at DESC);

COMMENT ON TABLE password_history IS 'Password change history to prevent reuse';

-- TABLE 8: sso_connections
CREATE TABLE IF NOT EXISTS sso_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    provider_type VARCHAR(100) NOT NULL,
    
    -- Configuration
    is_enabled BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    allow_signup BOOLEAN DEFAULT false,
    require_mfa BOOLEAN DEFAULT false,
    
    -- Provider Details (SAML)
    issuer VARCHAR(500),
    entity_id VARCHAR(500),
    sso_url VARCHAR(500),
    slo_url VARCHAR(500),
    certificate TEXT,
    metadata_url VARCHAR(500),
    metadata_xml TEXT,
    
    -- OAuth/OIDC
    client_id VARCHAR(255),
    client_secret TEXT,
    authorization_url VARCHAR(500),
    token_url VARCHAR(500),
    userinfo_url VARCHAR(500),
    scopes TEXT[],
    
    -- LDAP
    ldap_url VARCHAR(500),
    ldap_bind_dn VARCHAR(500),
    ldap_bind_password TEXT,
    ldap_base_dn VARCHAR(500),
    ldap_user_filter VARCHAR(500),
    ldap_attributes JSONB,
    
    -- Attribute Mapping
    attribute_mapping JSONB,
    role_mapping JSONB,
    
    -- Settings
    settings JSONB,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    CONSTRAINT chk_provider_type CHECK (provider_type IN ('saml', 'oidc', 'oauth2', 'ldap')),
    UNIQUE(name)
);

CREATE INDEX idx_sso_connections_provider ON sso_connections(provider_type);
CREATE INDEX idx_sso_connections_enabled ON sso_connections(is_enabled) WHERE is_enabled = true;

COMMENT ON TABLE sso_connections IS 'SSO provider configurations (SAML, OAuth, OIDC, LDAP)';

-- TABLE 9: saml_sessions
CREATE TABLE IF NOT EXISTS saml_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sso_connection_id UUID NOT NULL REFERENCES sso_connections(id),
    
    -- SAML Details
    saml_session_index VARCHAR(255),
    saml_name_id VARCHAR(255),
    saml_assertion TEXT,
    saml_response TEXT,
    
    -- Session
    initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    terminated_at TIMESTAMP,
    
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_saml_sessions_user ON saml_sessions(user_id);
CREATE INDEX idx_saml_sessions_connection ON saml_sessions(sso_connection_id);

COMMENT ON TABLE saml_sessions IS 'Active SAML SSO sessions';

-- TABLE 10: social_auth_connections
CREATE TABLE IF NOT EXISTS social_auth_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(100) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    
    -- Profile Data
    provider_email VARCHAR(255),
    provider_name VARCHAR(255),
    provider_avatar_url TEXT,
    provider_profile_url TEXT,
    provider_access_token TEXT,
    provider_refresh_token TEXT,
    provider_token_expires_at TIMESTAMP,
    provider_scope TEXT[],
    provider_raw_data JSONB,
    
    -- Status
    is_primary BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT true,
    connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_social_provider CHECK (provider IN ('google', 'microsoft', 'linkedin', 'github', 'facebook', 'twitter')),
    UNIQUE(provider, provider_user_id),
    UNIQUE(user_id, provider)
);

CREATE INDEX idx_social_auth_user ON social_auth_connections(user_id);
CREATE INDEX idx_social_auth_provider ON social_auth_connections(provider, provider_user_id);

COMMENT ON TABLE social_auth_connections IS 'Social login connections (Google, Microsoft, etc.)';

-- TABLE 11: magic_links
CREATE TABLE IF NOT EXISTS magic_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    token_hash VARCHAR(255) NOT NULL,
    
    -- Purpose
    purpose VARCHAR(100) NOT NULL,
    
    -- Status
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Security
    max_uses INTEGER DEFAULT 1,
    use_count INTEGER DEFAULT 0,
    
    CONSTRAINT chk_magic_purpose CHECK (purpose IN ('login', 'signup', 'password_reset', 'email_verification'))
);

CREATE INDEX idx_magic_links_token ON magic_links(token_hash);
CREATE INDEX idx_magic_links_email ON magic_links(email);
CREATE INDEX idx_magic_links_valid ON magic_links(email) WHERE used_at IS NULL AND expires_at > CURRENT_TIMESTAMP;

COMMENT ON TABLE magic_links IS 'Passwordless magic link tokens';

-- TABLE 12: webauthn_credentials
CREATE TABLE IF NOT EXISTS webauthn_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Credential Details
    credential_id TEXT NOT NULL UNIQUE,
    credential_public_key TEXT NOT NULL,
    counter BIGINT DEFAULT 0,
    credential_device_type VARCHAR(50),
    
    -- Device Info
    device_name VARCHAR(255),
    aaguid TEXT,
    attestation_format VARCHAR(50),
    attestation_object TEXT,
    
    -- Trust
    is_backed_up BOOLEAN DEFAULT false,
    transports TEXT[],
    
    -- Usage
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP,
    use_count INTEGER DEFAULT 0,
    
    is_active BOOLEAN DEFAULT true,
    
    CONSTRAINT chk_credential_device_type CHECK (credential_device_type IS NULL OR credential_device_type IN ('platform', 'cross-platform'))
);

CREATE INDEX idx_webauthn_user ON webauthn_credentials(user_id);
CREATE INDEX idx_webauthn_credential ON webauthn_credentials(credential_id);

COMMENT ON TABLE webauthn_credentials IS 'WebAuthn/FIDO2 credentials for passwordless auth';

-- TABLE 13: security_events
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    event_category VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    
    -- Event Details
    event_name VARCHAR(255) NOT NULL,
    event_description TEXT,
    event_data JSONB,
    
    -- Context
    ip_address VARCHAR(45),
    ip_country VARCHAR(100),
    ip_city VARCHAR(255),
    user_agent TEXT,
    device_id TEXT,
    session_id UUID,
    
    -- Risk Analysis
    risk_score INTEGER DEFAULT 0,
    is_anomaly BOOLEAN DEFAULT false,
    anomaly_reason VARCHAR(255),
    
    -- Response
    action_taken VARCHAR(255),
    requires_review BOOLEAN DEFAULT false,
    reviewed_at TIMESTAMP,
    reviewed_by UUID REFERENCES users(id),
    review_notes TEXT,
    
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_severity CHECK (severity IN ('info', 'warning', 'high', 'critical')),
    CONSTRAINT chk_event_category CHECK (event_category IN ('authentication', 'authorization', 'account', 'session', 'mfa', 'password', 'data_access')),
    CONSTRAINT chk_event_risk_score CHECK (risk_score BETWEEN 0 AND 100)
);

CREATE INDEX idx_security_events_user ON security_events(user_id);
CREATE INDEX idx_security_events_type ON security_events(event_type);
CREATE INDEX idx_security_events_category ON security_events(event_category);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_time ON security_events(occurred_at DESC);
CREATE INDEX idx_security_events_review ON security_events(requires_review) WHERE requires_review = true;

COMMENT ON TABLE security_events IS 'Comprehensive security event log for audit and threat detection';

-- TABLE 14: ip_whitelist
CREATE TABLE IF NOT EXISTS ip_whitelist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID,
    
    -- IP Details
    ip_address VARCHAR(45) NOT NULL,
    ip_range VARCHAR(50),
    description VARCHAR(255),
    
    -- Scope
    applies_to VARCHAR(50) DEFAULT 'user',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_applies_to CHECK (applies_to IN ('user', 'organization', 'global')),
    CONSTRAINT chk_has_user_or_org CHECK (user_id IS NOT NULL OR organization_id IS NOT NULL)
);

CREATE INDEX idx_ip_whitelist_user ON ip_whitelist(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_ip_whitelist_org ON ip_whitelist(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX idx_ip_whitelist_ip ON ip_whitelist(ip_address);

COMMENT ON TABLE ip_whitelist IS 'IP address whitelist for enhanced security';

-- TABLE 15: ip_blacklist
CREATE TABLE IF NOT EXISTS ip_blacklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address VARCHAR(45) NOT NULL,
    ip_range VARCHAR(50),
    reason VARCHAR(255) NOT NULL,
    
    -- Detection
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    detection_source VARCHAR(100),
    threat_level VARCHAR(20),
    
    -- Context
    blocked_attempts INTEGER DEFAULT 0,
    associated_users TEXT[],
    associated_events UUID[],
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_detection_source CHECK (detection_source IS NULL OR detection_source IN ('manual', 'automated', 'threat_intelligence', 'brute_force')),
    CONSTRAINT chk_threat_level CHECK (threat_level IS NULL OR threat_level IN ('low', 'medium', 'high', 'critical')),
    UNIQUE(ip_address)
);

CREATE INDEX idx_ip_blacklist_ip ON ip_blacklist(ip_address);
CREATE INDEX idx_ip_blacklist_active ON ip_blacklist(ip_address) WHERE is_active = true;

COMMENT ON TABLE ip_blacklist IS 'IP address blacklist for threat blocking';

-- TABLE 16: geofence_rules
CREATE TABLE IF NOT EXISTS geofence_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID,
    
    -- Rule Details
    name VARCHAR(255) NOT NULL,
    rule_type VARCHAR(50) NOT NULL,
    countries TEXT[],
    regions TEXT[],
    cities TEXT[],
    ip_ranges TEXT[],
    
    -- Action
    action VARCHAR(50) NOT NULL,
    notification_emails TEXT[],
    
    -- Priority
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_rule_type CHECK (rule_type IN ('allow', 'deny')),
    CONSTRAINT chk_geofence_action CHECK (action IN ('block', 'require_mfa', 'notify', 'allow'))
);

CREATE INDEX idx_geofence_user ON geofence_rules(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_geofence_org ON geofence_rules(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX idx_geofence_active ON geofence_rules(is_active) WHERE is_active = true;

COMMENT ON TABLE geofence_rules IS 'Geographic access control rules';

-- TABLE 17: risk_scores
CREATE TABLE IF NOT EXISTS risk_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES user_sessions(id),
    event_id UUID,
    
    -- Score Details
    risk_score INTEGER NOT NULL,
    risk_level VARCHAR(20),
    confidence_score INTEGER,
    
    -- Factors
    factors JSONB,
    anomalies TEXT[],
    
    -- Analysis
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    analysis_method VARCHAR(100),
    model_version VARCHAR(50),
    
    -- Context
    ip_address VARCHAR(45),
    device_id TEXT,
    location VARCHAR(255),
    time_of_day INTEGER,
    
    CONSTRAINT chk_risk_score_value CHECK (risk_score BETWEEN 0 AND 100),
    CONSTRAINT chk_confidence CHECK (confidence_score IS NULL OR confidence_score BETWEEN 0 AND 100),
    CONSTRAINT chk_risk_level CHECK (risk_level IS NULL OR risk_level IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT chk_analysis_method CHECK (analysis_method IS NULL OR analysis_method IN ('rule_based', 'ml_model', 'hybrid'))
);

CREATE INDEX idx_risk_scores_user ON risk_scores(user_id);
CREATE INDEX idx_risk_scores_session ON risk_scores(session_id);
CREATE INDEX idx_risk_scores_level ON risk_scores(risk_level);
CREATE INDEX idx_risk_scores_time ON risk_scores(analyzed_at DESC);

COMMENT ON TABLE risk_scores IS 'Risk scoring for authentication attempts and sessions';

-- TABLE 18: delegated_access
CREATE TABLE IF NOT EXISTS delegated_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delegator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    delegate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Scope
    access_level VARCHAR(50) NOT NULL,
    allowed_modules TEXT[],
    allowed_actions TEXT[],
    restrictions JSONB,
    
    -- Duration
    valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP NOT NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_revoked BOOLEAN DEFAULT false,
    revoked_at TIMESTAMP,
    revoked_by UUID REFERENCES users(id),
    revoke_reason VARCHAR(255),
    
    -- Approval
    requires_approval BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    
    -- Usage Tracking
    last_used_at TIMESTAMP,
    use_count INTEGER DEFAULT 0,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason TEXT,
    
    CONSTRAINT chk_access_level CHECK (access_level IN ('read_only', 'partial', 'full')),
    UNIQUE(delegator_id, delegate_id, valid_from)
);

CREATE INDEX idx_delegated_delegator ON delegated_access(delegator_id);
CREATE INDEX idx_delegated_delegate ON delegated_access(delegate_id);
CREATE INDEX idx_delegated_active ON delegated_access(delegate_id) 
    WHERE is_active = true AND is_revoked = false AND valid_until > CURRENT_TIMESTAMP;

COMMENT ON TABLE delegated_access IS 'Delegated access permissions between users';

-- TABLE 19: impersonation_sessions
CREATE TABLE IF NOT EXISTS impersonation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Session Details
    session_token VARCHAR(500) NOT NULL UNIQUE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    duration_minutes INTEGER,
    
    -- Justification & Approval
    reason TEXT NOT NULL,
    ticket_number VARCHAR(100),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    
    -- Security
    ip_address VARCHAR(45),
    user_agent TEXT,
    actions_performed JSONB[],
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_impersonation_admin ON impersonation_sessions(admin_user_id);
CREATE INDEX idx_impersonation_target ON impersonation_sessions(target_user_id);
CREATE INDEX idx_impersonation_active ON impersonation_sessions(is_active) WHERE is_active = true;

COMMENT ON TABLE impersonation_sessions IS 'Admin user impersonation audit trail';

-- TABLE 20: api_keys
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Key Details
    name VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(20) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    
    -- Permissions
    scopes TEXT[] NOT NULL,
    allowed_ips TEXT[],
    rate_limit INTEGER DEFAULT 1000,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP,
    
    -- Usage
    last_used_at TIMESTAMP,
    last_used_ip VARCHAR(45),
    total_requests INTEGER DEFAULT 0,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    revoked_at TIMESTAMP,
    revoked_by UUID REFERENCES users(id),
    revoke_reason VARCHAR(255)
);

CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_active ON api_keys(user_id) WHERE is_active = true AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP);

COMMENT ON TABLE api_keys IS 'API key authentication for programmatic access';

-- TABLE 21: api_key_usage
CREATE TABLE IF NOT EXISTS api_key_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
    
    -- Request Details
    endpoint VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER,
    response_time_ms INTEGER,
    
    -- Context
    ip_address VARCHAR(45),
    user_agent TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Data
    request_size_bytes INTEGER,
    response_size_bytes INTEGER,
    error_message TEXT
);

CREATE INDEX idx_api_usage_key ON api_key_usage(api_key_id);
CREATE INDEX idx_api_usage_time ON api_key_usage(requested_at DESC);
CREATE INDEX idx_api_usage_endpoint ON api_key_usage(endpoint);

COMMENT ON TABLE api_key_usage IS 'API key usage analytics and monitoring';

-- TABLE 22: oauth_clients
CREATE TABLE IF NOT EXISTS oauth_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Client Details
    client_id VARCHAR(255) NOT NULL UNIQUE,
    client_secret_hash VARCHAR(255),
    client_name VARCHAR(255) NOT NULL,
    client_type VARCHAR(50) NOT NULL,
    
    -- Application Info
    owner_user_id UUID REFERENCES users(id),
    organization_id UUID,
    description TEXT,
    logo_url TEXT,
    homepage_url TEXT,
    privacy_policy_url TEXT,
    terms_of_service_url TEXT,
    
    -- OAuth Configuration
    redirect_uris TEXT[] NOT NULL,
    allowed_scopes TEXT[] NOT NULL,
    grant_types TEXT[] NOT NULL,
    response_types TEXT[] NOT NULL,
    token_endpoint_auth_method VARCHAR(50),
    
    -- Token Settings
    access_token_lifetime INTEGER DEFAULT 3600,
    refresh_token_lifetime INTEGER DEFAULT 2592000,
    
    -- PKCE
    require_pkce BOOLEAN DEFAULT false,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_first_party BOOLEAN DEFAULT false,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_client_type CHECK (client_type IN ('confidential', 'public'))
);

CREATE INDEX idx_oauth_clients_id ON oauth_clients(client_id);
CREATE INDEX idx_oauth_clients_owner ON oauth_clients(owner_user_id);

COMMENT ON TABLE oauth_clients IS 'OAuth 2.0 client applications';

-- TABLE 23: oauth_authorization_codes
CREATE TABLE IF NOT EXISTS oauth_authorization_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(500) NOT NULL UNIQUE,
    client_id UUID NOT NULL REFERENCES oauth_clients(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Authorization Details
    redirect_uri TEXT NOT NULL,
    scopes TEXT[],
    
    -- PKCE
    code_challenge VARCHAR(255),
    code_challenge_method VARCHAR(10),
    
    -- Status
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    
    CONSTRAINT chk_code_challenge_method CHECK (code_challenge_method IS NULL OR code_challenge_method IN ('S256', 'plain'))
);

CREATE INDEX idx_oauth_codes_code ON oauth_authorization_codes(code);
CREATE INDEX idx_oauth_codes_client ON oauth_authorization_codes(client_id);
CREATE INDEX idx_oauth_codes_user ON oauth_authorization_codes(user_id);

COMMENT ON TABLE oauth_authorization_codes IS 'OAuth 2.0 authorization codes';

-- =====================================================
-- STEP 3: CREATE USEFUL VIEWS
-- =====================================================

-- View: Active Sessions Per User
CREATE OR REPLACE VIEW v_active_sessions AS
SELECT 
    u.id AS user_id,
    u.email,
    COUNT(s.id) AS active_session_count,
    MAX(s.last_activity_at) AS last_activity,
    ARRAY_AGG(s.device_type) AS device_types
FROM users u
LEFT JOIN user_sessions s ON u.id = s.user_id AND s.is_active = true AND s.expires_at > CURRENT_TIMESTAMP
GROUP BY u.id, u.email;

-- View: Failed Login Summary
CREATE OR REPLACE VIEW v_failed_login_summary AS
SELECT 
    email,
    COUNT(*) AS failed_attempts,
    MAX(attempted_at) AS last_failed_attempt,
    COUNT(DISTINCT ip_address) AS unique_ips
FROM login_attempts
WHERE success = false AND attempted_at > CURRENT_TIMESTAMP - INTERVAL '24 hours'
GROUP BY email
HAVING COUNT(*) >= 3;

-- View: Users Requiring MFA Setup
CREATE OR REPLACE VIEW v_users_needing_mfa AS
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.require_mfa,
    u.mfa_enabled
FROM users u
WHERE u.require_mfa = true AND u.mfa_enabled = false AND u.is_active = true;

-- =====================================================
-- STEP 4: CREATE HELPFUL FUNCTIONS
-- =====================================================

-- Function: Check if account should be locked
CREATE OR REPLACE FUNCTION check_account_lockout(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_failed_attempts INTEGER;
    v_lockout_threshold INTEGER := 5;
    v_time_window INTERVAL := INTERVAL '30 minutes';
BEGIN
    SELECT COUNT(*) INTO v_failed_attempts
    FROM login_attempts
    WHERE user_id = p_user_id
      AND success = false
      AND attempted_at > CURRENT_TIMESTAMP - v_time_window;
    
    RETURN v_failed_attempts >= v_lockout_threshold;
END;
$$ LANGUAGE plpgsql;

-- Function: Clean expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    WITH deleted AS (
        DELETE FROM user_sessions
        WHERE expires_at < CURRENT_TIMESTAMP
        RETURNING id
    )
    SELECT COUNT(*) INTO v_deleted_count FROM deleted;
    
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Generate backup codes
CREATE OR REPLACE FUNCTION generate_backup_codes(p_user_id UUID, p_count INTEGER DEFAULT 10)
RETURNS TABLE(code TEXT) AS $$
BEGIN
    -- Delete old unused codes
    DELETE FROM mfa_backup_codes
    WHERE user_id = p_user_id AND used_at IS NULL;
    
    -- Generate new codes
    RETURN QUERY
    INSERT INTO mfa_backup_codes (user_id, code_hash, expires_at)
    SELECT 
        p_user_id,
        md5(random()::text || clock_timestamp()::text),
        CURRENT_TIMESTAMP + INTERVAL '90 days'
    FROM generate_series(1, p_count)
    RETURNING substring(code_hash, 1, 8) AS code;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 5: SETUP AUTOMATIC CLEANUP JOBS (Manual Setup Required)
-- =====================================================

-- Note: These need to be setup as cron jobs or pg_cron
-- Example: SELECT cron.schedule('cleanup-sessions', '0 2 * * *', 'SELECT cleanup_expired_sessions()');

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Phase 1 Authentication Migration Complete';
    RAISE NOTICE 'Tables Created: 23 new tables';
    RAISE NOTICE 'Users Table Enhanced: 30+ new columns';
    RAISE NOTICE 'Indexes Created: 100+ indexes';
    RAISE NOTICE 'Views Created: 3 views';
    RAISE NOTICE 'Functions Created: 3 functions';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Run backend services (NestJS modules)';
    RAISE NOTICE '2. Configure environment variables for MFA';
    RAISE NOTICE '3. Test authentication flows';
    RAISE NOTICE '==============================================';
END $$;
