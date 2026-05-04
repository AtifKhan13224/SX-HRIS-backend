-- ============================================================================
-- NEW HIRE TEMPLATES DATABASE MIGRATION
-- Version: 1.0.0
-- Date: 2026-04-29
-- Description: Tables for new hire onboarding templates, instances, tasks,
--              approvals, documents, automations, and notifications
-- ============================================================================

-- Drop existing tables (if recreating)
-- DROP TABLE IF EXISTS notification_logs CASCADE;
-- DROP TABLE IF EXISTS automation_logs CASCADE;
-- DROP TABLE IF EXISTS instance_documents CASCADE;
-- DROP TABLE IF EXISTS task_approvals CASCADE;
-- DROP TABLE IF EXISTS instance_tasks CASCADE;
-- DROP TABLE IF EXISTS new_hire_instances CASCADE;
-- DROP TABLE IF EXISTS new_hire_templates CASCADE;

-- ============================================================================
-- TABLE: new_hire_templates
-- Description: Master template definitions for onboarding workflows
-- ============================================================================

CREATE TABLE new_hire_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_type VARCHAR(50) NOT NULL DEFAULT 'ONBOARDING',
  version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
  
  -- Core Configuration (JSONB)
  configuration JSONB NOT NULL DEFAULT '{}',
  pages JSONB NOT NULL DEFAULT '[]',
  workflow JSONB NOT NULL DEFAULT '{}',
  roles JSONB NOT NULL DEFAULT '[]',
  dashboards JSONB NOT NULL DEFAULT '[]',
  
  -- Optional Configuration (JSONB)
  integrations JSONB DEFAULT '[]',
  automations JSONB DEFAULT '[]',
  notifications JSONB DEFAULT '[]',
  analytics JSONB DEFAULT '{}',
  
  -- Status & Publishing
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  publishing_status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
  author VARCHAR(255),
  published_at TIMESTAMP,
  
  -- Classification & Metadata
  classification JSONB DEFAULT '{}',
  usage JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_template_type CHECK (template_type IN ('ONBOARDING', 'OFFBOARDING', 'TRANSFER', 'PROMOTION', 'LEAVE', 'CUSTOM')),
  CONSTRAINT chk_publishing_status CHECK (publishing_status IN ('DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED', 'DEPRECATED'))
);

-- Indexes for new_hire_templates
CREATE INDEX idx_templates_name ON new_hire_templates(name);
CREATE INDEX idx_templates_type ON new_hire_templates(template_type);
CREATE INDEX idx_templates_status ON new_hire_templates(publishing_status);
CREATE INDEX idx_templates_active ON new_hire_templates(is_active);
CREATE INDEX idx_templates_published ON new_hire_templates(is_published);
CREATE INDEX idx_templates_created ON new_hire_templates(created_at DESC);

-- Comments
COMMENT ON TABLE new_hire_templates IS 'Master template definitions for onboarding workflows';
COMMENT ON COLUMN new_hire_templates.configuration IS 'Template configuration including duration, triggers, completion criteria';
COMMENT ON COLUMN new_hire_templates.pages IS 'Array of page definitions with blocks and layouts';
COMMENT ON COLUMN new_hire_templates.workflow IS 'Workflow definition with phases, tasks, and state machine';
COMMENT ON COLUMN new_hire_templates.roles IS 'Role-based access control and permissions';
COMMENT ON COLUMN new_hire_templates.dashboards IS 'Dashboard configurations for each role';

-- ============================================================================
-- TABLE: new_hire_instances
-- Description: Active onboarding instances for employees
-- ============================================================================

CREATE TABLE new_hire_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES new_hire_templates(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL,
  
  -- Status & Timeline
  status VARCHAR(50) NOT NULL DEFAULT 'NOT_STARTED',
  timeline JSONB NOT NULL DEFAULT '{}',
  
  -- Progress Tracking
  progress JSONB NOT NULL DEFAULT '{}',
  collected_data JSONB NOT NULL DEFAULT '{}',
  task_statuses JSONB NOT NULL DEFAULT '[]',
  phase_statuses JSONB NOT NULL DEFAULT '[]',
  
  -- Participants & Audit
  participants JSONB NOT NULL DEFAULT '{}',
  audit_log JSONB NOT NULL DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_instance_status CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED', 'FAILED'))
);

-- Indexes for new_hire_instances
CREATE INDEX idx_instances_template ON new_hire_instances(template_id);
CREATE INDEX idx_instances_employee ON new_hire_instances(employee_id);
CREATE INDEX idx_instances_status ON new_hire_instances(status);
CREATE INDEX idx_instances_created ON new_hire_instances(created_at DESC);
CREATE INDEX idx_instances_timeline ON new_hire_instances USING GIN (timeline jsonb_path_ops);

-- Comments
COMMENT ON TABLE new_hire_instances IS 'Active onboarding instances for employees';
COMMENT ON COLUMN new_hire_instances.timeline IS 'Start date, planned/actual completion dates';
COMMENT ON COLUMN new_hire_instances.progress IS 'Overall percentage, phases/tasks/documents/approvals counts';
COMMENT ON COLUMN new_hire_instances.collected_data IS 'Data collected from forms and blocks';
COMMENT ON COLUMN new_hire_instances.task_statuses IS 'Status of each task in the workflow';
COMMENT ON COLUMN new_hire_instances.phase_statuses IS 'Status of each workflow phase';
COMMENT ON COLUMN new_hire_instances.audit_log IS 'Chronological log of all actions and changes';

-- ============================================================================
-- TABLE: instance_tasks
-- Description: Individual tasks within onboarding instances
-- ============================================================================

CREATE TABLE instance_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES new_hire_instances(id) ON DELETE CASCADE,
  task_id VARCHAR(255) NOT NULL,
  phase_id VARCHAR(255) NOT NULL,
  
  -- Task Details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'NOT_STARTED',
  
  -- Assignment
  assigned_to VARCHAR(50) NOT NULL,
  assigned_user_id UUID,
  
  -- Dates
  due_date TIMESTAMP,
  actual_start_date TIMESTAMP,
  actual_completion_date TIMESTAMP,
  completed_by UUID,
  
  -- Task Properties
  priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
  blocks_advancement BOOLEAN NOT NULL DEFAULT FALSE,
  requires_approval BOOLEAN NOT NULL DEFAULT FALSE,
  approval_requirements JSONB,
  dependencies JSONB NOT NULL DEFAULT '[]',
  
  -- Collaboration
  comments JSONB NOT NULL DEFAULT '[]',
  attachments JSONB NOT NULL DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_task_status CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'CANCELLED', 'FAILED')),
  CONSTRAINT chk_task_priority CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  CONSTRAINT chk_task_assignment CHECK (assigned_to IN ('NEW_HIRE', 'MANAGER', 'HR', 'IT', 'BUDDY', 'APPROVER', 'CUSTOM_ROLE'))
);

-- Indexes for instance_tasks
CREATE INDEX idx_tasks_instance ON instance_tasks(instance_id);
CREATE INDEX idx_tasks_status ON instance_tasks(status);
CREATE INDEX idx_tasks_assigned ON instance_tasks(assigned_to);
CREATE INDEX idx_tasks_assigned_user ON instance_tasks(assigned_user_id);
CREATE INDEX idx_tasks_due_date ON instance_tasks(due_date);
CREATE INDEX idx_tasks_priority ON instance_tasks(priority);
CREATE INDEX idx_tasks_requires_approval ON instance_tasks(requires_approval) WHERE requires_approval = TRUE;

-- Comments
COMMENT ON TABLE instance_tasks IS 'Individual tasks within onboarding instances';
COMMENT ON COLUMN instance_tasks.task_id IS 'Reference to task definition in template';
COMMENT ON COLUMN instance_tasks.assigned_to IS 'Role assigned to the task';
COMMENT ON COLUMN instance_tasks.assigned_user_id IS 'Specific user assigned to the task';
COMMENT ON COLUMN instance_tasks.blocks_advancement IS 'Whether task blocks progression to next phase';
COMMENT ON COLUMN instance_tasks.dependencies IS 'Array of task IDs that must complete first';

-- ============================================================================
-- TABLE: task_approvals
-- Description: Approval records for tasks requiring approval
-- ============================================================================

CREATE TABLE task_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES instance_tasks(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL,
  
  -- Approval Status
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  comments TEXT,
  
  -- Approval Dates
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_approval_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'DELEGATED'))
);

-- Indexes for task_approvals
CREATE INDEX idx_approvals_task ON task_approvals(task_id);
CREATE INDEX idx_approvals_approver ON task_approvals(approver_id);
CREATE INDEX idx_approvals_status ON task_approvals(status);
CREATE INDEX idx_approvals_created ON task_approvals(created_at DESC);

-- Comments
COMMENT ON TABLE task_approvals IS 'Approval records for tasks requiring approval';
COMMENT ON COLUMN task_approvals.approver_id IS 'User ID of the approver';

-- ============================================================================
-- TABLE: instance_documents
-- Description: Documents uploaded during onboarding
-- ============================================================================

CREATE TABLE instance_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES new_hire_instances(id) ON DELETE CASCADE,
  
  -- Document Details
  document_category VARCHAR(255) NOT NULL,
  file_name VARCHAR(500) NOT NULL,
  file_path VARCHAR(1000) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size BIGINT NOT NULL,
  
  -- Document Properties
  is_required BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  
  -- Upload & Verification
  uploaded_by UUID,
  uploaded_at TIMESTAMP,
  verified_by UUID,
  verified_at TIMESTAMP,
  
  -- Processing
  virus_scan_completed BOOLEAN NOT NULL DEFAULT FALSE,
  virus_scan_passed BOOLEAN NOT NULL DEFAULT TRUE,
  ocr_completed BOOLEAN NOT NULL DEFAULT FALSE,
  ocr_text TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_document_status CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED'))
);

-- Indexes for instance_documents
CREATE INDEX idx_documents_instance ON instance_documents(instance_id);
CREATE INDEX idx_documents_category ON instance_documents(document_category);
CREATE INDEX idx_documents_status ON instance_documents(status);
CREATE INDEX idx_documents_uploaded_by ON instance_documents(uploaded_by);
CREATE INDEX idx_documents_verified_by ON instance_documents(verified_by);
CREATE INDEX idx_documents_virus_scan ON instance_documents(virus_scan_completed, virus_scan_passed);
CREATE INDEX idx_documents_ocr ON instance_documents(ocr_completed);

-- Comments
COMMENT ON TABLE instance_documents IS 'Documents uploaded during onboarding process';
COMMENT ON COLUMN instance_documents.virus_scan_completed IS 'Whether anti-virus scan has been performed';
COMMENT ON COLUMN instance_documents.virus_scan_passed IS 'Whether document passed virus scan';
COMMENT ON COLUMN instance_documents.ocr_completed IS 'Whether OCR text extraction completed';
COMMENT ON COLUMN instance_documents.ocr_text IS 'Text extracted via OCR for searchability';

-- ============================================================================
-- TABLE: automation_logs
-- Description: Logs of automated actions triggered by workflows
-- ============================================================================

CREATE TABLE automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL,
  automation_id VARCHAR(255) NOT NULL,
  automation_type VARCHAR(50) NOT NULL,
  
  -- Execution Status
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  triggered_at TIMESTAMP NOT NULL,
  executed_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Execution Data
  input JSONB,
  output JSONB,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_automation_type CHECK (automation_type IN ('SCHEDULED', 'EVENT_TRIGGERED', 'CONDITIONAL', 'MANUAL')),
  CONSTRAINT chk_automation_status CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'))
);

-- Indexes for automation_logs
CREATE INDEX idx_automation_instance ON automation_logs(instance_id);
CREATE INDEX idx_automation_type ON automation_logs(automation_type);
CREATE INDEX idx_automation_status ON automation_logs(status);
CREATE INDEX idx_automation_triggered ON automation_logs(triggered_at DESC);

-- Comments
COMMENT ON TABLE automation_logs IS 'Logs of automated actions triggered by workflows';
COMMENT ON COLUMN automation_logs.automation_type IS 'Type of automation trigger';
COMMENT ON COLUMN automation_logs.retry_count IS 'Number of retry attempts for failed automations';

-- ============================================================================
-- TABLE: notification_logs
-- Description: Logs of notifications sent during onboarding
-- ============================================================================

CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL,
  notification_id VARCHAR(255) NOT NULL,
  
  -- Notification Details
  channel VARCHAR(50) NOT NULL,
  recipient_id UUID NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  
  -- Delivery Status
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,
  
  -- Error Handling
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_notification_channel CHECK (channel IN ('EMAIL', 'SMS', 'PUSH', 'IN_APP', 'SLACK', 'TEAMS', 'WEBHOOK')),
  CONSTRAINT chk_notification_status CHECK (status IN ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'BOUNCED'))
);

-- Indexes for notification_logs
CREATE INDEX idx_notifications_instance ON notification_logs(instance_id);
CREATE INDEX idx_notifications_recipient ON notification_logs(recipient_id);
CREATE INDEX idx_notifications_channel ON notification_logs(channel);
CREATE INDEX idx_notifications_status ON notification_logs(status);
CREATE INDEX idx_notifications_sent ON notification_logs(sent_at DESC);

-- Comments
COMMENT ON TABLE notification_logs IS 'Logs of notifications sent during onboarding';
COMMENT ON COLUMN notification_logs.channel IS 'Notification delivery channel';
COMMENT ON COLUMN notification_logs.retry_count IS 'Number of retry attempts for failed notifications';

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Active Onboarding Pipeline View
CREATE OR REPLACE VIEW v_active_onboarding_pipeline AS
SELECT 
  i.id AS instance_id,
  i.employee_id,
  t.name AS template_name,
  i.status,
  i.timeline->>'startDate' AS start_date,
  i.timeline->>'plannedCompletionDate' AS planned_completion_date,
  (i.progress->>'overallPercentage')::INTEGER AS completion_percentage,
  (i.progress->>'phasesCompleted')::INTEGER AS phases_completed,
  (i.progress->>'phasesTotal')::INTEGER AS phases_total,
  (i.progress->>'tasksCompleted')::INTEGER AS tasks_completed,
  (i.progress->>'tasksTotal')::INTEGER AS tasks_total,
  i.created_at,
  i.updated_at
FROM new_hire_instances i
JOIN new_hire_templates t ON i.template_id = t.id
WHERE i.status IN ('NOT_STARTED', 'IN_PROGRESS', 'PAUSED')
ORDER BY i.created_at DESC;

COMMENT ON VIEW v_active_onboarding_pipeline IS 'Overview of all active onboarding instances';

-- Pending Approvals View
CREATE OR REPLACE VIEW v_pending_approvals AS
SELECT 
  a.id AS approval_id,
  a.task_id,
  t.name AS task_name,
  t.instance_id,
  i.employee_id,
  a.approver_id,
  a.status,
  t.due_date,
  a.created_at,
  EXTRACT(DAY FROM NOW() - a.created_at) AS days_pending
FROM task_approvals a
JOIN instance_tasks t ON a.task_id = t.id
JOIN new_hire_instances i ON t.instance_id = i.id
WHERE a.status = 'PENDING'
ORDER BY a.created_at ASC;

COMMENT ON VIEW v_pending_approvals IS 'All tasks pending approval';

-- Overdue Tasks View
CREATE OR REPLACE VIEW v_overdue_tasks AS
SELECT 
  t.id AS task_id,
  t.name AS task_name,
  t.instance_id,
  i.employee_id,
  t.assigned_to,
  t.assigned_user_id,
  t.due_date,
  t.status,
  t.priority,
  EXTRACT(DAY FROM NOW() - t.due_date) AS days_overdue
FROM instance_tasks t
JOIN new_hire_instances i ON t.instance_id = i.id
WHERE t.status NOT IN ('COMPLETED', 'CANCELLED')
  AND t.due_date < NOW()
ORDER BY t.due_date ASC;

COMMENT ON VIEW v_overdue_tasks IS 'All overdue tasks across instances';

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to calculate instance completion percentage
CREATE OR REPLACE FUNCTION calculate_instance_progress(instance_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  total_tasks INTEGER;
  completed_tasks INTEGER;
  progress_pct INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_tasks
  FROM instance_tasks
  WHERE instance_id = instance_uuid;
  
  SELECT COUNT(*) INTO completed_tasks
  FROM instance_tasks
  WHERE instance_id = instance_uuid AND status = 'COMPLETED';
  
  IF total_tasks = 0 THEN
    RETURN 0;
  ELSE
    progress_pct := ROUND((completed_tasks::NUMERIC / total_tasks::NUMERIC) * 100);
    RETURN progress_pct;
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_instance_progress IS 'Calculate overall completion percentage for an instance';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update instance progress when task status changes
CREATE OR REPLACE FUNCTION update_instance_progress()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status = 'COMPLETED') THEN
    UPDATE new_hire_instances
    SET 
      progress = jsonb_set(
        progress,
        '{overallPercentage}',
        to_jsonb(calculate_instance_progress(NEW.instance_id))
      ),
      updated_at = NOW()
    WHERE id = NEW.instance_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_instance_progress
AFTER UPDATE ON instance_tasks
FOR EACH ROW
EXECUTE FUNCTION update_instance_progress();

COMMENT ON TRIGGER trigger_update_instance_progress ON instance_tasks IS 'Auto-update instance progress when task status changes';

-- ============================================================================
-- GRANTS (Adjust based on your user roles)
-- ============================================================================

-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO hr_admin;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO hr_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO hr_admin, hr_user;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
