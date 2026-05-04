-- Create org_view_settings table
CREATE TABLE IF NOT EXISTS org_view_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) UNIQUE NOT NULL,
    core_config JSONB,
    visibility_rules JSONB,
    hierarchy_config JSONB,
    search_config JSONB,
    filter_templates JSONB,
    filter_groups JSONB,
    searchable_fields JSONB,
    performance_config JSONB,
    caching_config JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Create search_analytics table
CREATE TABLE IF NOT EXISTS search_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    search_query VARCHAR(500) NOT NULL,
    results_count INTEGER DEFAULT 0,
    response_time INTEGER,
    no_results BOOLEAN DEFAULT FALSE,
    selected_result VARCHAR(255),
    filters JSONB,
    search_engine VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for search_analytics
CREATE INDEX IF NOT EXISTS idx_search_analytics_tenant_id ON search_analytics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_search_analytics_created_at ON search_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_search_analytics_tenant_created ON search_analytics(tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_search_analytics_query ON search_analytics(search_query);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_org_view_settings_modtime
    BEFORE UPDATE ON org_view_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Insert default settings for demo tenant (optional)
INSERT INTO org_view_settings (tenant_id, search_config, performance_config, caching_config)
VALUES (
    'default',
    '{"selectedEngine": "elasticsearch", "elasticsearch": {"clusterEndpoint": "http://localhost:9200", "indexName": "employee-org-data", "refreshInterval": "realtime", "fuzzyMatching": true, "autoComplete": true, "resultHighlighting": true, "stemming": false, "phoneticMatching": false, "synonymExpansion": false}, "behavior": {"minQueryLength": 2, "maxResultsPerPage": 50, "searchTimeout": 5000, "fuzzyDistance": "AUTO"}}',
    '{"queryOptimization": "balanced", "indexRefreshRate": "5s", "enableCaching": true, "compressResults": true, "parallelExecution": false}',
    '{"cacheSize": 512, "cacheTTL": 300, "cachePopularQueries": true, "preWarmCache": true, "distributedCache": false}'
)
ON CONFLICT (tenant_id) DO NOTHING;
