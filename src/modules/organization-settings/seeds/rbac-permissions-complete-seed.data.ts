// Complete RBAC Permissions Seed Data
// This defines ALL permissions in the system across all modules

export const RBAC_PERMISSIONS_SEED = [
  // ==================== EMPLOYEE CENTRAL ====================
  // Personal Data
  { code: 'EC_PERSONAL_VIEW', name: 'View Personal Data', module: 'EMPLOYEE_CENTRAL', subModule: 'PERSONAL_DATA', action: 'VIEW', category: 'CORE', isSensitive: true, riskLevel: 3 },
  { code: 'EC_PERSONAL_CREATE', name: 'Create Personal Data', module: 'EMPLOYEE_CENTRAL', subModule: 'PERSONAL_DATA', action: 'CREATE', category: 'CORE', isSensitive: true, riskLevel: 4 },
  { code: 'EC_PERSONAL_EDIT', name: 'Edit Personal Data', module: 'EMPLOYEE_CENTRAL', subModule: 'PERSONAL_DATA', action: 'EDIT', category: 'CORE', isSensitive: true, riskLevel: 4 },
  { code: 'EC_PERSONAL_DELETE', name: 'Delete Personal Data', module: 'EMPLOYEE_CENTRAL', subModule: 'PERSONAL_DATA', action: 'DELETE', category: 'CORE', isSensitive: true, riskLevel: 5 },
  { code: 'EC_PERSONAL_EXPORT', name: 'Export Personal Data', module: 'EMPLOYEE_CENTRAL', subModule: 'PERSONAL_DATA', action: 'EXPORT', category: 'CORE', isSensitive: true, riskLevel: 4 },
  
  // Employment Info
  { code: 'EC_EMPLOYMENT_VIEW', name: 'View Employment Info', module: 'EMPLOYEE_CENTRAL', subModule: 'EMPLOYMENT_INFO', action: 'VIEW', category: 'CORE', isSensitive: false, riskLevel: 2 },
  { code: 'EC_EMPLOYMENT_EDIT', name: 'Edit Employment Info', module: 'EMPLOYEE_CENTRAL', subModule: 'EMPLOYMENT_INFO', action: 'EDIT', category: 'CORE', isSensitive: false, riskLevel: 3 },
  { code: 'EC_EMPLOYMENT_APPROVE', name: 'Approve Employment Changes', module: 'EMPLOYEE_CENTRAL', subModule: 'EMPLOYMENT_INFO', action: 'APPROVE', category: 'CORE', isSensitive: false, riskLevel: 4 },
  { code: 'EC_EMPLOYMENT_EXPORT', name: 'Export Employment Data', module: 'EMPLOYEE_CENTRAL', subModule: 'EMPLOYMENT_INFO', action: 'EXPORT', category: 'CORE', isSensitive: false, riskLevel: 3 },

  // Job Info
  { code: 'EC_JOB_VIEW', name: 'View Job Information', module: 'EMPLOYEE_CENTRAL', subModule: 'JOB_INFO', action: 'VIEW', category: 'CORE', isSensitive: false, riskLevel: 2 },
  { code: 'EC_JOB_EDIT', name: 'Edit Job Information', module: 'EMPLOYEE_CENTRAL', subModule: 'JOB_INFO', action: 'EDIT', category: 'CORE', isSensitive: false, riskLevel: 3 },
  { code: 'EC_JOB_APPROVE', name: 'Approve Job Changes', module: 'EMPLOYEE_CENTRAL', subModule: 'JOB_INFO', action: 'APPROVE', category: 'CORE', isSensitive: false, riskLevel: 4 },

  // Audit
  { code: 'EC_AUDIT_VIEW', name: 'View Employee Audit Logs', module: 'EMPLOYEE_CENTRAL', subModule: 'AUDIT', action: 'VIEW', category: 'AUDIT', isSensitive: true, riskLevel: 3 },
  { code: 'EC_AUDIT_EXPORT', name: 'Export Employee Audit Logs', module: 'EMPLOYEE_CENTRAL', subModule: 'AUDIT', action: 'EXPORT', category: 'AUDIT', isSensitive: true, riskLevel: 4 },

  // ==================== RECRUITING ====================
  // Job Postings
  { code: 'REC_JOBPOST_VIEW', name: 'View Job Postings', module: 'RECRUITING', subModule: 'JOB_POSTINGS', action: 'VIEW', category: 'RECRUITING', isSensitive: false, riskLevel: 1 },
  { code: 'REC_JOBPOST_CREATE', name: 'Create Job Postings', module: 'RECRUITING', subModule: 'JOB_POSTINGS', action: 'CREATE', category: 'RECRUITING', isSensitive: false, riskLevel: 2 },
  { code: 'REC_JOBPOST_EDIT', name: 'Edit Job Postings', module: 'RECRUITING', subModule: 'JOB_POSTINGS', action: 'EDIT', category: 'RECRUITING', isSensitive: false, riskLevel: 2 },
  { code: 'REC_JOBPOST_DELETE', name: 'Delete Job Postings', module: 'RECRUITING', subModule: 'JOB_POSTINGS', action: 'DELETE', category: 'RECRUITING', isSensitive: false, riskLevel: 3 },
  { code: 'REC_JOBPOST_APPROVE', name: 'Approve Job Postings', module: 'RECRUITING', subModule: 'JOB_POSTINGS', action: 'APPROVE', category: 'RECRUITING', isSensitive: false, riskLevel: 3 },
  { code: 'REC_JOBPOST_PUBLISH', name: 'Publish Job Postings', module: 'RECRUITING', subModule: 'JOB_POSTINGS', action: 'EXPORT', category: 'RECRUITING', isSensitive: false, riskLevel: 2 },

  // Candidates
  { code: 'REC_CANDIDATE_VIEW', name: 'View Candidates', module: 'RECRUITING', subModule: 'CANDIDATES', action: 'VIEW', category: 'RECRUITING', isSensitive: true, riskLevel: 2 },
  { code: 'REC_CANDIDATE_CREATE', name: 'Create Candidates', module: 'RECRUITING', subModule: 'CANDIDATES', action: 'CREATE', category: 'RECRUITING', isSensitive: true, riskLevel: 3 },
  { code: 'REC_CANDIDATE_EDIT', name: 'Edit Candidates', module: 'RECRUITING', subModule: 'CANDIDATES', action: 'EDIT', category: 'RECRUITING', isSensitive: true, riskLevel: 3 },
  { code: 'REC_CANDIDATE_DELETE', name: 'Delete Candidates', module: 'RECRUITING', subModule: 'CANDIDATES', action: 'DELETE', category: 'RECRUITING', isSensitive: true, riskLevel: 4 },
  { code: 'REC_CANDIDATE_EXPORT', name: 'Export Candidate Data', module: 'RECRUITING', subModule: 'CANDIDATES', action: 'EXPORT', category: 'RECRUITING', isSensitive: true, riskLevel: 4 },

  // Applications
  { code: 'REC_APPLICATION_VIEW', name: 'View Applications', module: 'RECRUITING', subModule: 'APPLICATIONS', action: 'VIEW', category: 'RECRUITING', isSensitive: false, riskLevel: 2 },
  { code: 'REC_APPLICATION_REVIEW', name: 'Review Applications', module: 'RECRUITING', subModule: 'APPLICATIONS', action: 'EDIT', category: 'RECRUITING', isSensitive: false, riskLevel: 2 },
  { code: 'REC_APPLICATION_APPROVE', name: 'Approve Applications', module: 'RECRUITING', subModule: 'APPLICATIONS', action: 'APPROVE', category: 'RECRUITING', isSensitive: false, riskLevel: 3 },
  { code: 'REC_APPLICATION_REJECT', name: 'Reject Applications', module: 'RECRUITING', subModule: 'APPLICATIONS', action: 'REJECT', category: 'RECRUITING', isSensitive: false, riskLevel: 3 },

  // Interviews
  { code: 'REC_INTERVIEW_VIEW', name: 'View Interviews', module: 'RECRUITING', subModule: 'INTERVIEWS', action: 'VIEW', category: 'RECRUITING', isSensitive: false, riskLevel: 2 },
  { code: 'REC_INTERVIEW_CREATE', name: 'Schedule Interviews', module: 'RECRUITING', subModule: 'INTERVIEWS', action: 'CREATE', category: 'RECRUITING', isSensitive: false, riskLevel: 2 },
  { code: 'REC_INTERVIEW_EDIT', name: 'Edit Interviews', module: 'RECRUITING', subModule: 'INTERVIEWS', action: 'EDIT', category: 'RECRUITING', isSensitive: false, riskLevel: 2 },
  { code: 'REC_INTERVIEW_DELETE', name: 'Cancel Interviews', module: 'RECRUITING', subModule: 'INTERVIEWS', action: 'DELETE', category: 'RECRUITING', isSensitive: false, riskLevel: 3 },

  // Offers
  { code: 'REC_OFFER_VIEW', name: 'View Offers', module: 'RECRUITING', subModule: 'OFFERS', action: 'VIEW', category: 'RECRUITING', isSensitive: true, riskLevel: 3 },
  { code: 'REC_OFFER_CREATE', name: 'Create Offers', module: 'RECRUITING', subModule: 'OFFERS', action: 'CREATE', category: 'RECRUITING', isSensitive: true, riskLevel: 4 },
  { code: 'REC_OFFER_EDIT', name: 'Edit Offers', module: 'RECRUITING', subModule: 'OFFERS', action: 'EDIT', category: 'RECRUITING', isSensitive: true, riskLevel: 4 },
  { code: 'REC_OFFER_APPROVE', name: 'Approve Offers', module: 'RECRUITING', subModule: 'OFFERS', action: 'APPROVE', category: 'RECRUITING', isSensitive: true, riskLevel: 5 },

  // ==================== PERFORMANCE ====================
  // Goal Management
  { code: 'PERF_GOAL_VIEW', name: 'View Goals', module: 'PERFORMANCE', subModule: 'GOAL_MANAGEMENT', action: 'VIEW', category: 'PERFORMANCE', isSensitive: false, riskLevel: 2 },
  { code: 'PERF_GOAL_CREATE', name: 'Create Goals', module: 'PERFORMANCE', subModule: 'GOAL_MANAGEMENT', action: 'CREATE', category: 'PERFORMANCE', isSensitive: false, riskLevel: 2 },
  { code: 'PERF_GOAL_EDIT', name: 'Edit Goals', module: 'PERFORMANCE', subModule: 'GOAL_MANAGEMENT', action: 'EDIT', category: 'PERFORMANCE', isSensitive: false, riskLevel: 2 },
  { code: 'PERF_GOAL_DELETE', name: 'Delete Goals', module: 'PERFORMANCE', subModule: 'GOAL_MANAGEMENT', action: 'DELETE', category: 'PERFORMANCE', isSensitive: false, riskLevel: 3 },
  { code: 'PERF_GOAL_APPROVE', name: 'Approve Goals', module: 'PERFORMANCE', subModule: 'GOAL_MANAGEMENT', action: 'APPROVE', category: 'PERFORMANCE', isSensitive: false, riskLevel: 3 },

  // Reviews
  { code: 'PERF_REVIEW_VIEW', name: 'View Performance Reviews', module: 'PERFORMANCE', subModule: 'REVIEWS', action: 'VIEW', category: 'PERFORMANCE', isSensitive: true, riskLevel: 3 },
  { code: 'PERF_REVIEW_CREATE', name: 'Create Performance Reviews', module: 'PERFORMANCE', subModule: 'REVIEWS', action: 'CREATE', category: 'PERFORMANCE', isSensitive: true, riskLevel: 3 },
  { code: 'PERF_REVIEW_EDIT', name: 'Edit Performance Reviews', module: 'PERFORMANCE', subModule: 'REVIEWS', action: 'EDIT', category: 'PERFORMANCE', isSensitive: true, riskLevel: 3 },
  { code: 'PERF_REVIEW_APPROVE', name: 'Approve Performance Reviews', module: 'PERFORMANCE', subModule: 'REVIEWS', action: 'APPROVE', category: 'PERFORMANCE', isSensitive: true, riskLevel: 4 },
  { code: 'PERF_REVIEW_EXPORT', name: 'Export Performance Reviews', module: 'PERFORMANCE', subModule: 'REVIEWS', action: 'EXPORT', category: 'PERFORMANCE', isSensitive: true, riskLevel: 4 },

  // Talent Review
  { code: 'PERF_TALENT_VIEW', name: 'View Talent Reviews', module: 'PERFORMANCE', subModule: 'TALENT_REVIEW', action: 'VIEW', category: 'PERFORMANCE', isSensitive: true, riskLevel: 4 },
  { code: 'PERF_TALENT_EDIT', name: 'Edit Talent Reviews', module: 'PERFORMANCE', subModule: 'TALENT_REVIEW', action: 'EDIT', category: 'PERFORMANCE', isSensitive: true, riskLevel: 4 },

  // ==================== LEARNING ====================
  // Courses
  { code: 'LEARN_COURSE_VIEW', name: 'View Courses', module: 'LEARNING', subModule: 'COURSES', action: 'VIEW', category: 'LEARNING', isSensitive: false, riskLevel: 1 },
  { code: 'LEARN_COURSE_CREATE', name: 'Create Courses', module: 'LEARNING', subModule: 'COURSES', action: 'CREATE', category: 'LEARNING', isSensitive: false, riskLevel: 2 },
  { code: 'LEARN_COURSE_EDIT', name: 'Edit Courses', module: 'LEARNING', subModule: 'COURSES', action: 'EDIT', category: 'LEARNING', isSensitive: false, riskLevel: 2 },
  { code: 'LEARN_COURSE_DELETE', name: 'Delete Courses', module: 'LEARNING', subModule: 'COURSES', action: 'DELETE', category: 'LEARNING', isSensitive: false, riskLevel: 3 },
  { code: 'LEARN_COURSE_APPROVE', name: 'Approve Courses', module: 'LEARNING', subModule: 'COURSES', action: 'APPROVE', category: 'LEARNING', isSensitive: false, riskLevel: 3 },
  { code: 'LEARN_COURSE_ENROLL', name: 'Enroll in Courses', module: 'LEARNING', subModule: 'COURSES', action: 'CREATE', category: 'LEARNING', isSensitive: false, riskLevel: 1 },

  // Enrollments
  { code: 'LEARN_ENROLL_VIEW', name: 'View Enrollments', module: 'LEARNING', subModule: 'ENROLLMENTS', action: 'VIEW', category: 'LEARNING', isSensitive: false, riskLevel: 2 },
  { code: 'LEARN_ENROLL_CREATE', name: 'Create Enrollments', module: 'LEARNING', subModule: 'ENROLLMENTS', action: 'CREATE', category: 'LEARNING', isSensitive: false, riskLevel: 2 },
  { code: 'LEARN_ENROLL_EDIT', name: 'Edit Enrollments', module: 'LEARNING', subModule: 'ENROLLMENTS', action: 'EDIT', category: 'LEARNING', isSensitive: false, riskLevel: 2 },
  { code: 'LEARN_ENROLL_DELETE', name: 'Delete Enrollments', module: 'LEARNING', subModule: 'ENROLLMENTS', action: 'DELETE', category: 'LEARNING', isSensitive: false, riskLevel: 3 },

  // Certifications
  { code: 'LEARN_CERT_VIEW', name: 'View Certifications', module: 'LEARNING', subModule: 'CERTIFICATIONS', action: 'VIEW', category: 'LEARNING', isSensitive: false, riskLevel: 2 },
  { code: 'LEARN_CERT_CREATE', name: 'Issue Certifications', module: 'LEARNING', subModule: 'CERTIFICATIONS', action: 'CREATE', category: 'LEARNING', isSensitive: false, riskLevel: 3 },
  { code: 'LEARN_CERT_EDIT', name: 'Edit Certifications', module: 'LEARNING', subModule: 'CERTIFICATIONS', action: 'EDIT', category: 'LEARNING', isSensitive: false, riskLevel: 3 },
  { code: 'LEARN_CERT_APPROVE', name: 'Approve Certifications', module: 'LEARNING', subModule: 'CERTIFICATIONS', action: 'APPROVE', category: 'LEARNING', isSensitive: false, riskLevel: 3 },

  // ==================== SUCCESSION ====================
  // Succession Plans
  { code: 'SUCC_PLAN_VIEW', name: 'View Succession Plans', module: 'SUCCESSION', subModule: 'SUCCESSION_PLANS', action: 'VIEW', category: 'TALENT', isSensitive: true, riskLevel: 4 },
  { code: 'SUCC_PLAN_CREATE', name: 'Create Succession Plans', module: 'SUCCESSION', subModule: 'SUCCESSION_PLANS', action: 'CREATE', category: 'TALENT', isSensitive: true, riskLevel: 4 },
  { code: 'SUCC_PLAN_EDIT', name: 'Edit Succession Plans', module: 'SUCCESSION', subModule: 'SUCCESSION_PLANS', action: 'EDIT', category: 'TALENT', isSensitive: true, riskLevel: 4 },
  { code: 'SUCC_PLAN_DELETE', name: 'Delete Succession Plans', module: 'SUCCESSION', subModule: 'SUCCESSION_PLANS', action: 'DELETE', category: 'TALENT', isSensitive: true, riskLevel: 5 },

  // Talent Pools
  { code: 'SUCC_POOL_VIEW', name: 'View Talent Pools', module: 'SUCCESSION', subModule: 'TALENT_POOLS', action: 'VIEW', category: 'TALENT', isSensitive: true, riskLevel: 3 },
  { code: 'SUCC_POOL_CREATE', name: 'Create Talent Pools', module: 'SUCCESSION', subModule: 'TALENT_POOLS', action: 'CREATE', category: 'TALENT', isSensitive: true, riskLevel: 3 },
  { code: 'SUCC_POOL_EDIT', name: 'Edit Talent Pools', module: 'SUCCESSION', subModule: 'TALENT_POOLS', action: 'EDIT', category: 'TALENT', isSensitive: true, riskLevel: 3 },

  // ==================== COMPENSATION ====================
  // Payroll
  { code: 'COMP_PAYROLL_VIEW', name: 'View Payroll', module: 'COMPENSATION', subModule: 'PAYROLL', action: 'VIEW', category: 'FINANCE', isSensitive: true, riskLevel: 4 },
  { code: 'COMP_PAYROLL_PROCESS', name: 'Process Payroll', module: 'COMPENSATION', subModule: 'PAYROLL', action: 'CREATE', category: 'FINANCE', isSensitive: true, riskLevel: 5 },
  { code: 'COMP_PAYROLL_APPROVE', name: 'Approve Payroll', module: 'COMPENSATION', subModule: 'PAYROLL', action: 'APPROVE', category: 'FINANCE', isSensitive: true, riskLevel: 5 },
  { code: 'COMP_PAYROLL_EXPORT', name: 'Export Payroll', module: 'COMPENSATION', subModule: 'PAYROLL', action: 'EXPORT', category: 'FINANCE', isSensitive: true, riskLevel: 5 },

  // Salary
  { code: 'COMP_SALARY_VIEW', name: 'View Salary Information', module: 'COMPENSATION', subModule: 'SALARY', action: 'VIEW', category: 'FINANCE', isSensitive: true, riskLevel: 4 },
  { code: 'COMP_SALARY_EDIT', name: 'Edit Salary Information', module: 'COMPENSATION', subModule: 'SALARY', action: 'EDIT', category: 'FINANCE', isSensitive: true, riskLevel: 5 },
  { code: 'COMP_SALARY_APPROVE', name: 'Approve Salary Changes', module: 'COMPENSATION', subModule: 'SALARY', action: 'APPROVE', category: 'FINANCE', isSensitive: true, riskLevel: 5 },

  // Payslips
  { code: 'COMP_PAYSLIP_VIEW', name: 'View Payslips', module: 'COMPENSATION', subModule: 'PAYSLIPS', action: 'VIEW', category: 'FINANCE', isSensitive: true, riskLevel: 3 },
  { code: 'COMP_PAYSLIP_GENERATE', name: 'Generate Payslips', module: 'COMPENSATION', subModule: 'PAYSLIPS', action: 'CREATE', category: 'FINANCE', isSensitive: true, riskLevel: 4 },
  { code: 'COMP_PAYSLIP_DOWNLOAD', name: 'Download Payslips', module: 'COMPENSATION', subModule: 'PAYSLIPS', action: 'EXPORT', category: 'FINANCE', isSensitive: true, riskLevel: 3 },
  { code: 'COMP_PAYSLIP_EXPORT', name: 'Export Payslips', module: 'COMPENSATION', subModule: 'PAYSLIPS', action: 'EXPORT', category: 'FINANCE', isSensitive: true, riskLevel: 4 },

  // Audit
  { code: 'COMP_AUDIT_VIEW', name: 'View Compensation Audit', module: 'COMPENSATION', subModule: 'AUDIT', action: 'VIEW', category: 'AUDIT', isSensitive: true, riskLevel: 4 },

  // ==================== TIME MANAGEMENT ====================
  // Time Off
  { code: 'TIME_OFF_VIEW', name: 'View Time Off', module: 'TIME_MANAGEMENT', subModule: 'TIME_OFF', action: 'VIEW', category: 'TIME', isSensitive: false, riskLevel: 2 },
  { code: 'TIME_OFF_CREATE', name: 'Request Time Off', module: 'TIME_MANAGEMENT', subModule: 'TIME_OFF', action: 'CREATE', category: 'TIME', isSensitive: false, riskLevel: 1 },
  { code: 'TIME_OFF_EDIT', name: 'Edit Time Off', module: 'TIME_MANAGEMENT', subModule: 'TIME_OFF', action: 'EDIT', category: 'TIME', isSensitive: false, riskLevel: 2 },
  { code: 'TIME_OFF_DELETE', name: 'Cancel Time Off', module: 'TIME_MANAGEMENT', subModule: 'TIME_OFF', action: 'DELETE', category: 'TIME', isSensitive: false, riskLevel: 2 },
  { code: 'TIME_OFF_APPROVE', name: 'Approve Time Off', module: 'TIME_MANAGEMENT', subModule: 'TIME_OFF', action: 'APPROVE', category: 'TIME', isSensitive: false, riskLevel: 3 },
  { code: 'TIME_OFF_REJECT', name: 'Reject Time Off', module: 'TIME_MANAGEMENT', subModule: 'TIME_OFF', action: 'REJECT', category: 'TIME', isSensitive: false, riskLevel: 3 },

  // Timesheets
  { code: 'TIMESHEET_VIEW', name: 'View Timesheets', module: 'TIME_MANAGEMENT', subModule: 'TIMESHEETS', action: 'VIEW', category: 'TIME', isSensitive: false, riskLevel: 2 },
  { code: 'TIMESHEET_CREATE', name: 'Create Timesheets', module: 'TIME_MANAGEMENT', subModule: 'TIMESHEETS', action: 'CREATE', category: 'TIME', isSensitive: false, riskLevel: 1 },
  { code: 'TIMESHEET_EDIT', name: 'Edit Timesheets', module: 'TIME_MANAGEMENT', subModule: 'TIMESHEETS', action: 'EDIT', category: 'TIME', isSensitive: false, riskLevel: 2 },
  { code: 'TIMESHEET_APPROVE', name: 'Approve Timesheets', module: 'TIME_MANAGEMENT', subModule: 'TIMESHEETS', action: 'APPROVE', category: 'TIME', isSensitive: false, riskLevel: 3 },
  { code: 'TIMESHEET_EXPORT', name: 'Export Timesheets', module: 'TIME_MANAGEMENT', subModule: 'TIMESHEETS', action: 'EXPORT', category: 'TIME', isSensitive: false, riskLevel: 3 },

  // Audit
  { code: 'TIME_AUDIT_VIEW', name: 'View Time Audit Logs', module: 'TIME_MANAGEMENT', subModule: 'AUDIT', action: 'VIEW', category: 'AUDIT', isSensitive: false, riskLevel: 3 },

  // ==================== ANALYTICS ====================
  { code: 'ANALYTICS_VIEW', name: 'View Analytics', module: 'ANALYTICS', action: 'VIEW', category: 'ANALYTICS', isSensitive: false, riskLevel: 2 },
  { code: 'ANALYTICS_EXPORT', name: 'Export Analytics', module: 'ANALYTICS', action: 'EXPORT', category: 'ANALYTICS', isSensitive: true, riskLevel: 3 },
  { code: 'ANALYTICS_HR_VIEW', name: 'View HR Analytics', module: 'ANALYTICS', subModule: 'HR', action: 'VIEW', category: 'ANALYTICS', isSensitive: false, riskLevel: 2 },
  { code: 'ANALYTICS_HR_EXPORT', name: 'Export HR Analytics', module: 'ANALYTICS', subModule: 'HR', action: 'EXPORT', category: 'ANALYTICS', isSensitive: true, riskLevel: 3 },
  { code: 'ANALYTICS_COMPENSATION_VIEW', name: 'View Compensation Analytics', module: 'ANALYTICS', subModule: 'COMPENSATION', action: 'VIEW', category: 'ANALYTICS', isSensitive: true, riskLevel: 4 },
  { code: 'ANALYTICS_COMPENSATION_EXPORT', name: 'Export Compensation Analytics', module: 'ANALYTICS', subModule: 'COMPENSATION', action: 'EXPORT', category: 'ANALYTICS', isSensitive: true, riskLevel: 4 },
  { code: 'ANALYTICS_LEARNING_VIEW', name: 'View Learning Analytics', module: 'ANALYTICS', subModule: 'LEARNING', action: 'VIEW', category: 'ANALYTICS', isSensitive: false, riskLevel: 2 },
  { code: 'ANALYTICS_LEARNING_EXPORT', name: 'Export Learning Analytics', module: 'ANALYTICS', subModule: 'LEARNING', action: 'EXPORT', category: 'ANALYTICS', isSensitive: false, riskLevel: 3 },

  // ==================== ADMIN ====================
  // Audit Logs
  { code: 'ADMIN_AUDIT_VIEW', name: 'View System Audit Logs', module: 'ADMIN', subModule: 'AUDIT_LOGS', action: 'VIEW', category: 'ADMIN', isSensitive: true, riskLevel: 4 },
  { code: 'ADMIN_AUDIT_EXPORT', name: 'Export System Audit Logs', module: 'ADMIN', subModule: 'AUDIT_LOGS', action: 'EXPORT', category: 'ADMIN', isSensitive: true, riskLevel: 5 },

  // RBAC Management
  { code: 'ADMIN_RBAC_VIEW', name: 'View RBAC Configuration', module: 'ADMIN', subModule: 'RBAC', action: 'VIEW', category: 'ADMIN', isSensitive: true, riskLevel: 4 },
  { code: 'ADMIN_RBAC_EDIT', name: 'Edit RBAC Configuration', module: 'ADMIN', subModule: 'RBAC', action: 'EDIT', category: 'ADMIN', isSensitive: true, riskLevel: 5 },
  { code: 'ADMIN_RBAC_AUDIT', name: 'View RBAC Audit Logs', module: 'ADMIN', subModule: 'RBAC', action: 'VIEW', category: 'AUDIT', isSensitive: true, riskLevel: 4 },

  // System Settings
  { code: 'ADMIN_SETTINGS_VIEW', name: 'View System Settings', module: 'ADMIN', subModule: 'SETTINGS', action: 'VIEW', category: 'ADMIN', isSensitive: false, riskLevel: 3 },
  { code: 'ADMIN_SETTINGS_EDIT', name: 'Edit System Settings', module: 'ADMIN', subModule: 'SETTINGS', action: 'EDIT', category: 'ADMIN', isSensitive: true, riskLevel: 5 },

  // User Management
  { code: 'ADMIN_USER_VIEW', name: 'View Users', module: 'ADMIN', subModule: 'USER_MANAGEMENT', action: 'VIEW', category: 'ADMIN', isSensitive: false, riskLevel: 3 },
  { code: 'ADMIN_USER_CREATE', name: 'Create Users', module: 'ADMIN', subModule: 'USER_MANAGEMENT', action: 'CREATE', category: 'ADMIN', isSensitive: false, riskLevel: 4 },
  { code: 'ADMIN_USER_EDIT', name: 'Edit Users', module: 'ADMIN', subModule: 'USER_MANAGEMENT', action: 'EDIT', category: 'ADMIN', isSensitive: false, riskLevel: 4 },
  { code: 'ADMIN_USER_DELETE', name: 'Delete Users', module: 'ADMIN', subModule: 'USER_MANAGEMENT', action: 'DELETE', category: 'ADMIN', isSensitive: true, riskLevel: 5 },
];

export const mapPermissionsForDB = () => {
  return RBAC_PERMISSIONS_SEED.map(p => ({
    permissionCode: p.code,
    permissionName: p.name,
    permissionDescription: `${p.action} permission for ${p.subModule || p.module}`,
    module: p.module,
    subModule: p.subModule || null,
    feature: null,
    action: p.action,
    category: p.category,
    isActive: true,
    isSensitive: p.isSensitive,
    riskLevel: p.riskLevel,
    requiresMFA: p.riskLevel >= 4,
    requiresJustification: p.riskLevel >= 5,
    dataClassification: p.isSensitive ? 'CONFIDENTIAL' : 'INTERNAL',
    displayOrder: 0,
  }));
};

export default RBAC_PERMISSIONS_SEED;
