-- Migration: Create session management tables
-- Date: 2026-04-29
-- Phase 1: Critical Security Foundation

-- Table 1: Enhanced user_sessions
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
    
    CONSTRAINT chk_device_type CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown') OR device_type IS NULL),
    CONSTRAINT chk_risk_score CHECK (risk_score BETWEEN 0 AND 100),
    CONSTRAINT chk_trust_score CHECK (trust_score BETWEEN 0 AND 100)
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON user_sessions(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_device ON user_sessions(device_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON user_sessions(expires_at);

COMMENT ON TABLE user_sessions IS 'Enhanced session tracking with device and security information';

-- Table 2: user_devices
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
    
    CONSTRAINT chk_trust_score_device CHECK (trust_score BETWEEN 0 AND 100),
    UNIQUE(user_id, device_id)
);

CREATE INDEX IF NOT EXISTS idx_devices_user ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_trusted ON user_devices(user_id) WHERE is_trusted = true;
CREATE INDEX IF NOT EXISTS idx_devices_active ON user_devices(user_id) WHERE is_active = true;

COMMENT ON TABLE user_devices IS 'Track and manage user devices for security';

-- Table 3: login_attempts
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
    
    CONSTRAINT chk_risk_score_attempt CHECK (risk_score BETWEEN 0 AND 100)
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_user ON login_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_time ON login_attempts(attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_failed ON login_attempts(user_id, success) WHERE success = false;

COMMENT ON TABLE login_attempts IS 'Track all login attempts for security monitoring';

-- Table 4: account_lockouts
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
    
    CONSTRAINT chk_trigger_type CHECK (
        trigger_type IN ('failed_attempts', 'suspicious_activity', 'manual', 'compliance', 'admin')
        OR trigger_type IS NULL
    ),
    CONSTRAINT chk_unlock_method CHECK (
        unlock_method IN ('auto_expire', 'admin_unlock', 'password_reset', 'support_ticket')
        OR unlock_method IS NULL
    )
);

CREATE INDEX IF NOT EXISTS idx_lockouts_user ON account_lockouts(user_id);
CREATE INDEX IF NOT EXISTS idx_lockouts_active ON account_lockouts(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_lockouts_time ON account_lockouts(locked_until);

COMMENT ON TABLE account_lockouts IS 'Track account lockouts for security and compliance';
