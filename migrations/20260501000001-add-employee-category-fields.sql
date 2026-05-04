-- Migration: Add Employee Category and Related Fields
-- Date: 2026-05-01
-- Description: Adds employee category, visa information, and termination fields to employee table

-- Add employee category field
ALTER TABLE employee 
ADD COLUMN IF NOT EXISTS employeeCategory VARCHAR(50);

-- Add visa and immigration fields
ALTER TABLE employee 
ADD COLUMN IF NOT EXISTS visaNumber VARCHAR(100),
ADD COLUMN IF NOT EXISTS visaExpiryDate DATE,
ADD COLUMN IF NOT EXISTS sponsoringCompany VARCHAR(200),
ADD COLUMN IF NOT EXISTS missionStartDate DATE,
ADD COLUMN IF NOT EXISTS missionEndDate DATE;

-- Add termination fields
ALTER TABLE employee 
ADD COLUMN IF NOT EXISTS terminationDate DATE,
ADD COLUMN IF NOT EXISTS terminationReason TEXT;

-- Create index on employeeCategory for better query performance
CREATE INDEX IF NOT EXISTS idx_employee_category ON employee(employeeCategory);

-- Create index on terminationDate for reporting
CREATE INDEX IF NOT EXISTS idx_employee_termination_date ON employee(terminationDate);

-- Create index on visaExpiryDate for visa tracking
CREATE INDEX IF NOT EXISTS idx_employee_visa_expiry ON employee(visaExpiryDate);

-- Add comments for documentation
COMMENT ON COLUMN employee.employeeCategory IS 'Employee category code (e.g., ACT, TERM, EVIS, etc.)';
COMMENT ON COLUMN employee.visaNumber IS 'Visa/work permit number';
COMMENT ON COLUMN employee.visaExpiryDate IS 'Visa expiration date';
COMMENT ON COLUMN employee.sponsoringCompany IS 'Company sponsoring the visa';
COMMENT ON COLUMN employee.missionStartDate IS 'Mission/assignment start date';
COMMENT ON COLUMN employee.missionEndDate IS 'Mission/assignment end date';
COMMENT ON COLUMN employee.terminationDate IS 'Date of employment termination';
COMMENT ON COLUMN employee.terminationReason IS 'Reason for employment termination';
