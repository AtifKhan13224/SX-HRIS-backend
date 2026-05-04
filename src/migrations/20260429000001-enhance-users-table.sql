-- Migration: Enhance users table with enterprise authentication features
-- Date: 2026-04-29
-- Phase 1: Critical Security Foundation

-- Add MFA columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_method VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_secret TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_backup_codes_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_last_verified_at TIMESTAMP;

-- Add password policy columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_last_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_never_expires BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;

-- Add account security columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_locked_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lockout_reason VARCHAR(255);

-- Add SSO columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS sso_provider VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS sso_external_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS sso_metadata JSONB;

-- Add security settings columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS require_mfa BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS allowed_ip_addresses TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS geofence_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS max_concurrent_sessions INTEGER DEFAULT 3;
ALTER TABLE users ADD COLUMN IF NOT EXISTS session_timeout_minutes INTEGER DEFAULT 480;

-- Add verification columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_policy_accepted_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP;

-- Add last login tracking columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(45);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_device TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_location VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Add soft delete column
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Add constraints
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS chk_mfa_method 
    CHECK (mfa_method IN ('totp', 'sms', 'email', 'biometric', 'hardware_token') OR mfa_method IS NULL);

-- Update existing status constraint to include new statuses
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_status;
ALTER TABLE users ADD CONSTRAINT chk_status 
    CHECK (status IN ('active', 'inactive', 'suspended', 'locked', 'pending_verification', 'ACTIVE', 'INACTIVE'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_sso_provider ON users(sso_provider, sso_external_id) WHERE sso_provider IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_users_mfa_enabled ON users(mfa_enabled) WHERE mfa_enabled = true;
CREATE INDEX IF NOT EXISTS idx_users_locked ON users(account_locked_until) WHERE account_locked_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_deleted ON users(deleted_at) WHERE deleted_at IS NULL;

-- Update existing records
UPDATE users SET 
    password_last_changed_at = COALESCE(password_last_changed_at, created_at),
    login_count = COALESCE(login_count, 0),
    failed_login_attempts = COALESCE(failed_login_attempts, 0),
    email_verified = COALESCE(email_verified, false)
WHERE password_last_changed_at IS NULL OR login_count IS NULL;

COMMENT ON COLUMN users.mfa_enabled IS 'Whether MFA is enabled for this user';
COMMENT ON COLUMN users.mfa_method IS 'MFA method: totp, sms, email, biometric, hardware_token';
COMMENT ON COLUMN users.failed_login_attempts IS 'Number of consecutive failed login attempts';
COMMENT ON COLUMN users.account_locked_until IS 'Account locked until this timestamp';
COMMENT ON COLUMN users.password_expires_at IS 'Password expires at this timestamp';
