-- ===================================================
-- PICKLIST MANAGEMENT SYSTEM - DATABASE MIGRATION
-- Version: 1.0.0
-- Description: Create tables for enterprise-grade picklist management
-- ===================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================================
-- TABLE: picklists
-- Purpose: Main picklist definitions
-- ===================================================
CREATE TABLE IF NOT EXISTS picklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    internal_name VARCHAR(100) NOT NULL UNIQUE,
    display_label VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL DEFAULT 'custom' CHECK (type IN ('standard', 'custom', 'system')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft', 'deprecated')),
    is_hierarchical BOOLEAN DEFAULT FALSE,
    allow_multi_select BOOLEAN DEFAULT FALSE,
    is_searchable BOOLEAN DEFAULT FALSE,
    is_sortable BOOLEAN DEFAULT TRUE,
    requires_approval BOOLEAN DEFAULT FALSE,
    is_versioned BOOLEAN DEFAULT FALSE,
    support_external_sync BOOLEAN DEFAULT FALSE,
    external_sync_url VARCHAR(500),
    max_values INTEGER,
    metadata JSONB,
    edit_permissions TEXT[],
    view_permissions TEXT[],
    total_values INTEGER DEFAULT 0,
    active_values INTEGER DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    last_synced_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for picklists table
CREATE INDEX idx_picklists_internal_name ON picklists(internal_name);
CREATE INDEX idx_picklists_type ON picklists(type);
CREATE INDEX idx_picklists_status ON picklists(status);
CREATE INDEX idx_picklists_is_hierarchical ON picklists(is_hierarchical);
CREATE INDEX idx_picklists_created_at ON picklists(created_at);

-- ===================================================
-- TABLE: picklist_values
-- Purpose: Individual values within picklists
-- ===================================================
CREATE TABLE IF NOT EXISTS picklist_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    picklist_id UUID NOT NULL REFERENCES picklists(id) ON DELETE CASCADE,
    value VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    description TEXT,
    parent_value VARCHAR(100),
    "order" INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    effective_start_date DATE,
    effective_end_date DATE,
    metadata JSONB,
    translations JSONB,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(picklist_id, value)
);

-- Indexes for picklist_values table
CREATE INDEX idx_picklist_values_picklist_id ON picklist_values(picklist_id);
CREATE INDEX idx_picklist_values_parent_value ON picklist_values(parent_value);
CREATE INDEX idx_picklist_values_status ON picklist_values(status);
CREATE INDEX idx_picklist_values_order ON picklist_values("order");
CREATE INDEX idx_picklist_values_value ON picklist_values(value);

-- ===================================================
-- TABLE: picklist_dependencies
-- Purpose: Parent-child relationships between picklists
-- ===================================================
CREATE TABLE IF NOT EXISTS picklist_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_picklist_id UUID NOT NULL REFERENCES picklists(id) ON DELETE CASCADE,
    child_picklist_id UUID NOT NULL REFERENCES picklists(id) ON DELETE CASCADE,
    dependency_type VARCHAR(20) DEFAULT 'parent-child' CHECK (dependency_type IN ('parent-child', 'cascading', 'conditional')),
    mappings JSONB,
    options JSONB,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(parent_picklist_id, child_picklist_id)
);

-- Indexes for picklist_dependencies table
CREATE INDEX idx_picklist_dependencies_parent ON picklist_dependencies(parent_picklist_id);
CREATE INDEX idx_picklist_dependencies_child ON picklist_dependencies(child_picklist_id);

-- ===================================================
-- TABLE: picklist_versions
-- Purpose: Version history for picklists
-- ===================================================
CREATE TABLE IF NOT EXISTS picklist_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    picklist_id UUID NOT NULL REFERENCES picklists(id) ON DELETE CASCADE,
    version VARCHAR(50) NOT NULL,
    change_description TEXT NOT NULL,
    snapshot JSONB NOT NULL,
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(picklist_id, version)
);

-- Indexes for picklist_versions table
CREATE INDEX idx_picklist_versions_picklist_id ON picklist_versions(picklist_id);
CREATE INDEX idx_picklist_versions_created_at ON picklist_versions(created_at);

-- ===================================================
-- TABLE: picklist_usage_logs
-- Purpose: Track usage of picklist values
-- ===================================================
CREATE TABLE IF NOT EXISTS picklist_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    picklist_id UUID NOT NULL,
    value_id VARCHAR(100),
    field_name VARCHAR(200) NOT NULL,
    record_id VARCHAR(100),
    user_id VARCHAR(100),
    action_type VARCHAR(20) DEFAULT 'select' CHECK (action_type IN ('view', 'select', 'update')),
    context JSONB,
    used_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for picklist_usage_logs table
CREATE INDEX idx_picklist_usage_logs_picklist_id ON picklist_usage_logs(picklist_id);
CREATE INDEX idx_picklist_usage_logs_field_name ON picklist_usage_logs(field_name);
CREATE INDEX idx_picklist_usage_logs_used_at ON picklist_usage_logs(used_at);
CREATE INDEX idx_picklist_usage_logs_user_id ON picklist_usage_logs(user_id);

-- ===================================================
-- TABLE: picklist_audit_logs
-- Purpose: Audit trail for all picklist changes
-- ===================================================
CREATE TABLE IF NOT EXISTS picklist_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    picklist_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('create', 'update', 'delete', 'activate', 'deactivate', 'version', 'import', 'export', 'sync')),
    changes JSONB,
    old_values JSONB,
    new_values JSONB,
    performed_by VARCHAR(100) NOT NULL,
    ip_address VARCHAR(100),
    user_agent TEXT,
    performed_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for picklist_audit_logs table
CREATE INDEX idx_picklist_audit_logs_picklist_id ON picklist_audit_logs(picklist_id);
CREATE INDEX idx_picklist_audit_logs_action ON picklist_audit_logs(action);
CREATE INDEX idx_picklist_audit_logs_performed_at ON picklist_audit_logs(performed_at);
CREATE INDEX idx_picklist_audit_logs_performed_by ON picklist_audit_logs(performed_by);

-- ===================================================
-- TRIGGERS: Update timestamps automatically
-- ===================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for picklists
CREATE TRIGGER update_picklists_updated_at
    BEFORE UPDATE ON picklists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers for picklist_values
CREATE TRIGGER update_picklist_values_updated_at
    BEFORE UPDATE ON picklist_values
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers for picklist_dependencies
CREATE TRIGGER update_picklist_dependencies_updated_at
    BEFORE UPDATE ON picklist_dependencies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================================
-- VIEWS: Helpful views for analytics
-- ===================================================

-- View: Picklist summary with counts
CREATE OR REPLACE VIEW vw_picklist_summary AS
SELECT 
    p.id,
    p.internal_name,
    p.display_label,
    p.type,
    p.status,
    p.is_hierarchical,
    p.total_values,
    p.active_values,
    p.usage_count,
    COUNT(DISTINCT pd_parent.id) as dependencies_as_parent,
    COUNT(DISTINCT pd_child.id) as dependencies_as_child,
    COUNT(DISTINCT pv.id) as version_count,
    p.created_at,
    p.updated_at
FROM picklists p
LEFT JOIN picklist_dependencies pd_parent ON p.id = pd_parent.parent_picklist_id
LEFT JOIN picklist_dependencies pd_child ON p.id = pd_child.child_picklist_id
LEFT JOIN picklist_versions pv ON p.id = pv.picklist_id
GROUP BY p.id, p.internal_name, p.display_label, p.type, p.status, 
         p.is_hierarchical, p.total_values, p.active_values, 
         p.usage_count, p.created_at, p.updated_at;

-- View: Popular picklist values
CREATE OR REPLACE VIEW vw_popular_picklist_values AS
SELECT 
    pv.id,
    pv.picklist_id,
    p.internal_name as picklist_name,
    pv.value,
    pv.label,
    pv.usage_count,
    pv.last_used_at,
    COUNT(pul.id) as recent_usage_30_days
FROM picklist_values pv
INNER JOIN picklists p ON pv.picklist_id = p.id
LEFT JOIN picklist_usage_logs pul ON pv.id::text = pul.value_id 
    AND pul.used_at >= NOW() - INTERVAL '30 days'
GROUP BY pv.id, pv.picklist_id, p.internal_name, pv.value, 
         pv.label, pv.usage_count, pv.last_used_at
ORDER BY pv.usage_count DESC, recent_usage_30_days DESC;

-- View: Hierarchical picklist tree
CREATE OR REPLACE VIEW vw_hierarchical_picklist_tree AS
WITH RECURSIVE picklist_tree AS (
    -- Root level values (no parent)
    SELECT 
        pv.id,
        pv.picklist_id,
        pv.value,
        pv.label,
        pv.parent_value,
        0 as level,
        ARRAY[pv.value] as path,
        pv.value::text as full_path
    FROM picklist_values pv
    WHERE pv.parent_value IS NULL

    UNION ALL

    -- Child values
    SELECT 
        pv.id,
        pv.picklist_id,
        pv.value,
        pv.label,
        pv.parent_value,
        pt.level + 1,
        pt.path || pv.value,
        pt.full_path || ' > ' || pv.value
    FROM picklist_values pv
    INNER JOIN picklist_tree pt ON pv.parent_value = pt.value 
        AND pv.picklist_id = pt.picklist_id
)
SELECT * FROM picklist_tree
ORDER BY picklist_id, level, value;

-- ===================================================
-- INITIAL DATA: Create standard picklists (optional)
-- ===================================================

-- Note: Standard picklists will be created via the API endpoint
-- "Initialize Standard" for better control and auditing

-- ===================================================
-- GRANTS: Set appropriate permissions
-- ===================================================

-- Grant permissions to your application user
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- ===================================================
-- COMMENTS: Document the schema
-- ===================================================

COMMENT ON TABLE picklists IS 'Main picklist definitions with configuration and metadata';
COMMENT ON TABLE picklist_values IS 'Individual values within picklists supporting hierarchies and translations';
COMMENT ON TABLE picklist_dependencies IS 'Parent-child relationships for cascading picklists';
COMMENT ON TABLE picklist_versions IS 'Version history snapshots for picklists';
COMMENT ON TABLE picklist_usage_logs IS 'Usage tracking for analytics and optimization';
COMMENT ON TABLE picklist_audit_logs IS 'Complete audit trail for compliance and debugging';

COMMENT ON COLUMN picklists.internal_name IS 'Unique internal identifier used in code';
COMMENT ON COLUMN picklists.display_label IS 'User-friendly display name';
COMMENT ON COLUMN picklists.type IS 'standard: predefined, custom: user-created, system: protected';
COMMENT ON COLUMN picklists.is_hierarchical IS 'Supports parent-child relationships (unlimited depth)';
COMMENT ON COLUMN picklists.allow_multi_select IS 'Allow multiple value selection';
COMMENT ON COLUMN picklists.is_searchable IS 'Enable search functionality in UI';
COMMENT ON COLUMN picklists.metadata IS 'Custom metadata (icons, colors, categories, etc.)';

COMMENT ON COLUMN picklist_values.parent_value IS 'Parent value for hierarchical picklists';
COMMENT ON COLUMN picklist_values."order" IS 'Display order (0-indexed)';
COMMENT ON COLUMN picklist_values.effective_start_date IS 'Date when value becomes active';
COMMENT ON COLUMN picklist_values.effective_end_date IS 'Date when value expires';
COMMENT ON COLUMN picklist_values.translations IS 'Multi-language support';

-- ===================================================
-- MIGRATION COMPLETE
-- ===================================================

-- Verify tables created
SELECT 
    tablename, 
    schemaname 
FROM pg_tables 
WHERE tablename LIKE 'picklist%' 
ORDER BY tablename;

-- Display summary
DO $$
DECLARE
    table_count INTEGER;
    index_count INTEGER;
    view_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count FROM pg_tables WHERE tablename LIKE 'picklist%';
    SELECT COUNT(*) INTO index_count FROM pg_indexes WHERE indexname LIKE 'idx_picklist%';
    SELECT COUNT(*) INTO view_count FROM pg_views WHERE viewname LIKE 'vw_picklist%';
    
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'PICKLIST MANAGEMENT SYSTEM - MIGRATION COMPLETE';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'Indexes created: %', index_count;
    RAISE NOTICE 'Views created: %', view_count;
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Status: READY FOR PRODUCTION';
    RAISE NOTICE '=================================================';
END $$;
