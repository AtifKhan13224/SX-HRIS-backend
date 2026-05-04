-- Migration: Create MFA-related tables
-- Date: 2026-04-29
-- Phase 1: Critical Security Foundation

-- Table 1: user_mfa_settings
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
    
    CONSTRAINT chk_mfa_method CHECK (method IN ('totp', 'sms', 'email', 'biometric')),
    UNIQUE(user_id, method, device_id)
);

CREATE INDEX IF NOT EXISTS idx_mfa_user ON user_mfa_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_mfa_active ON user_mfa_settings(user_id) WHERE is_active = true;

COMMENT ON TABLE user_mfa_settings IS 'MFA configuration for users';
COMMENT ON COLUMN user_mfa_settings.totp_secret IS 'Encrypted TOTP secret';

-- Table 2: mfa_backup_codes
CREATE TABLE IF NOT EXISTS mfa_backup_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_hash VARCHAR(255) NOT NULL,
    used_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_code_not_used CHECK (used_at IS NULL OR used_at <= CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_backup_codes_user ON mfa_backup_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_backup_codes_unused ON mfa_backup_codes(user_id) WHERE used_at IS NULL;

COMMENT ON TABLE mfa_backup_codes IS 'Backup codes for MFA recovery';
COMMENT ON COLUMN mfa_backup_codes.code_hash IS 'Hashed backup code for security';

-- Table 3: password_history
CREATE TABLE IF NOT EXISTS password_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by UUID REFERENCES users(id),
    change_reason VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    CONSTRAINT chk_change_reason CHECK (
        change_reason IN ('manual', 'expired', 'reset', 'compromised', 'policy', 'admin') 
        OR change_reason IS NULL
    )
);

CREATE INDEX IF NOT EXISTS idx_password_history_user ON password_history(user_id);
CREATE INDEX IF NOT EXISTS idx_password_history_time ON password_history(changed_at DESC);

COMMENT ON TABLE password_history IS 'Password change history for policy enforcement';
