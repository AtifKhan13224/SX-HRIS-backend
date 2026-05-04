-- Migration: Create security events table
-- Date: 2026-04-29
-- Phase 1: Critical Security Foundation

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
    CONSTRAINT chk_risk_score_event CHECK (risk_score BETWEEN 0 AND 100),
    CONSTRAINT chk_event_category CHECK (
        event_category IN ('authentication', 'authorization', 'account', 'session', 'mfa', 'password', 'system')
    )
);

CREATE INDEX IF NOT EXISTS idx_security_events_user ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_category ON security_events(event_category);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_time ON security_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_review ON security_events(requires_review) WHERE requires_review = true;

COMMENT ON TABLE security_events IS 'Comprehensive security event logging for audit and compliance';
COMMENT ON COLUMN security_events.event_type IS 'Specific event type (e.g., login_failed, mfa_setup, account_locked)';
COMMENT ON COLUMN security_events.event_category IS 'High-level category for filtering';
COMMENT ON COLUMN security_events.severity IS 'Event severity level';
