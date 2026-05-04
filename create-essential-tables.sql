-- Essential tables for SX-HRIS to function
-- Run this in your Supabase SQL Editor

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'EMPLOYEE',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Group Companies table
CREATE TABLE IF NOT EXISTS group_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_code VARCHAR(50) UNIQUE NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    legal_name VARCHAR(200),
    registration_number VARCHAR(100),
    tax_identification_number VARCHAR(100),
    incorporation_date DATE,
    country VARCHAR(100),
    headquarters_address TEXT,
    logo_url TEXT,
    website VARCHAR(255),
    industry VARCHAR(100),
    company_size VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    is_headquarter BOOLEAN DEFAULT false,
    parent_company_id UUID REFERENCES group_companies(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Company Profiles table
CREATE TABLE IF NOT EXISTS company_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_company_id UUID REFERENCES group_companies(id),
    legal_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    incorporation_number VARCHAR(100),
    tax_id VARCHAR(100),
    industry VARCHAR(100),
    country VARCHAR(100),
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business Units table
CREATE TABLE IF NOT EXISTS business_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    group_company_id UUID REFERENCES group_companies(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Divisions table
CREATE TABLE IF NOT EXISTS division (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    business_unit_id UUID REFERENCES business_units(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    division_id UUID REFERENCES division(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employee table
CREATE TABLE IF NOT EXISTS employee (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    employee_number VARCHAR(50) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    date_of_birth DATE,
    hire_date DATE,
    department_id UUID REFERENCES departments(id),
    position VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_group_companies_code ON group_companies(company_code);
CREATE INDEX IF NOT EXISTS idx_business_units_code ON business_units(code);
CREATE INDEX IF NOT EXISTS idx_division_code ON division(code);
CREATE INDEX IF NOT EXISTS idx_departments_code ON departments(code);
CREATE INDEX IF NOT EXISTS idx_employee_number ON employee(employee_number);

-- Success message
SELECT 'Essential tables created successfully!' as message;
