-- Profile Field Definitions and Options Migration
-- Creates tables for managing configurable profile fields and their options

-- Create profile_field_definitions table
CREATE TABLE IF NOT EXISTS profile_field_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    field_key VARCHAR(100) NOT NULL,
    field_name VARCHAR(200) NOT NULL,
    description TEXT,
    field_type VARCHAR(50) NOT NULL DEFAULT 'single_select',
    category VARCHAR(50),
    is_system BOOLEAN NOT NULL DEFAULT false,
    is_required BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    validation_rules JSONB DEFAULT '{}',
    ui_config JSONB DEFAULT '{}',
    translations JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    CONSTRAINT uq_tenant_field_key UNIQUE(tenant_id, field_key)
);

-- Create profile_field_options table
CREATE TABLE IF NOT EXISTS profile_field_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_definition_id UUID NOT NULL REFERENCES profile_field_definitions(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL,
    display_value VARCHAR(200) NOT NULL,
    alias VARCHAR(50),
    description TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_system BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    applicable_for JSONB DEFAULT '{"employeeTypes": ["all"]}',
    metadata JSONB DEFAULT '{}',
    translations JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    CONSTRAINT uq_field_option_code UNIQUE(field_definition_id, code)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profile_fields_tenant ON profile_field_definitions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profile_fields_key ON profile_field_definitions(field_key);
CREATE INDEX IF NOT EXISTS idx_profile_fields_category ON profile_field_definitions(category);
CREATE INDEX IF NOT EXISTS idx_profile_fields_active ON profile_field_definitions(is_active);
CREATE INDEX IF NOT EXISTS idx_profile_field_options_field ON profile_field_options(field_definition_id);
CREATE INDEX IF NOT EXISTS idx_profile_field_options_code ON profile_field_options(code);
CREATE INDEX IF NOT EXISTS idx_profile_field_options_enabled ON profile_field_options(is_enabled);
CREATE INDEX IF NOT EXISTS idx_profile_field_options_sort ON profile_field_options(field_definition_id, sort_order);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_profile_fields_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER trigger_update_profile_field_definitions_updated_at
    BEFORE UPDATE ON profile_field_definitions
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_fields_updated_at();

CREATE TRIGGER trigger_update_profile_field_options_updated_at
    BEFORE UPDATE ON profile_field_options
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_fields_updated_at();

-- Add comments for documentation
COMMENT ON TABLE profile_field_definitions IS 'Stores field definitions for configurable profile data';
COMMENT ON TABLE profile_field_options IS 'Stores option values for select-type profile fields';
COMMENT ON COLUMN profile_field_definitions.field_key IS 'Unique identifier key for the field (e.g., gender, marital_status)';
COMMENT ON COLUMN profile_field_definitions.field_type IS 'Type of field: single_select, multi_select, text, number, date, boolean';
COMMENT ON COLUMN profile_field_definitions.category IS 'Category: personal, employment, contact, identification, custom';
COMMENT ON COLUMN profile_field_definitions.is_system IS 'System fields cannot be deleted or modified';
COMMENT ON COLUMN profile_field_definitions.validation_rules IS 'JSON object with validation rules (minLength, maxLength, pattern, etc.)';
COMMENT ON COLUMN profile_field_definitions.ui_config IS 'JSON object with UI configuration (displayType, icon, helpText, etc.)';
COMMENT ON COLUMN profile_field_definitions.translations IS 'JSON object with multi-language translations';
COMMENT ON COLUMN profile_field_options.applicable_for IS 'JSON object defining applicability rules (employeeTypes, departments, locations, etc.)';
COMMENT ON COLUMN profile_field_options.metadata IS 'JSON object with additional metadata (color, icon, badgeStyle, externalCode, etc.)';

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON profile_field_definitions TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON profile_field_options TO your_app_user;
