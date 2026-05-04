import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Background Check Entity
 * Comprehensive background verification with multiple check types
 * Enterprise-grade background screening
 */
@Entity('background_checks')
@Index(['companyId'])
@Index(['applicationId'])
@Index(['candidateId'])
@Index(['status'])
export class BackgroundCheck {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'company_id' })
  @Index()
  companyId: string;

  @Column({ type: 'uuid', name: 'application_id' })
  @Index()
  applicationId: string;

  @Column({ type: 'uuid', name: 'candidate_id' })
  @Index()
  candidateId: string;

  @Column({ type: 'uuid', name: 'requisition_id' })
  requisitionId: string;

  @Column({ type: 'varchar', length: 100, name: 'check_number', unique: true })
  @Index()
  checkNumber: string;

  // Provider Information
  @Column({ type: 'varchar', length: 100, nullable: true })
  provider: string; // Checkr, Sterling, HireRight, etc.

  @Column({ type: 'varchar', length: 200, name: 'provider_case_id', nullable: true })
  providerCaseId: string;

  @Column({ type: 'varchar', length: 500, name: 'provider_portal_url', nullable: true })
  providerPortalUrl: string;

  // Check Types
  @Column({ type: 'jsonb', name: 'check_types', default: [] })
  checkTypes: Array<{
    type: 'criminal' | 'employment' | 'education' | 'credit' | 'drug' | 'driving' | 'professional_license' | 'identity';
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
    result?: 'clear' | 'consider' | 'suspended' | 'dispute';
    completedAt?: Date;
    details?: any;
  }>;

  // Status
  @Column({ type: 'varchar', length: 50, default: 'pending' })
  @Index()
  status: string; // pending, consent_pending, initiated, in_progress, completed, cancelled, failed

  @Column({ type: 'varchar', length: 50, name: 'overall_result', nullable: true })
  overallResult: string; // clear, consider, suspended, dispute

  // Timeline
  @Column({ type: 'timestamp', name: 'requested_at' })
  requestedAt: Date;

  @Column({ type: 'timestamp', name: 'consent_sent_at', nullable: true })
  consentSentAt: Date;

  @Column({ type: 'timestamp', name: 'consent_received_at', nullable: true })
  consentReceivedAt: Date;

  @Column({ type: 'timestamp', name: 'initiated_at', nullable: true })
  initiatedAt: Date;

  @Column({ type: 'timestamp', name: 'completed_at', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', name: 'expires_at', nullable: true })
  expiresAt: Date;

  @Column({ type: 'int', name: 'turnaround_time_days', nullable: true })
  turnaroundTimeDays: number;

  // Consent & Authorization
  @Column({ type: 'boolean', name: 'consent_required', default: true })
  consentRequired: boolean;

  @Column({ type: 'boolean', name: 'consent_obtained', default: false })
  consentObtained: boolean;

  @Column({ type: 'varchar', length: 500, name: 'consent_form_url', nullable: true })
  consentFormUrl: string;

  @Column({ type: 'varchar', length: 500, name: 'signed_consent_url', nullable: true })
  signedConsentUrl: string;

  @Column({ type: 'varchar', length: 200, name: 'consent_ip_address', nullable: true })
  consentIpAddress: string;

  @Column({ type: 'text', name: 'consent_text', nullable: true })
  consentText: string;

  // Criminal History Check
  @Column({ type: 'jsonb', name: 'criminal_check', default: {} })
  criminalCheck: {
    status?: string;
    result?: string;
    jurisdictions?: string[];
    records?: Array<{
      type: string;
      jurisdiction: string;
      date: Date;
      disposition: string;
      description: string;
      severity: string;
    }>;
    clearanceDetails?: string;
  };

  // Employment Verification
  @Column({ type: 'jsonb', name: 'employment_verification', default: {} })
  employmentVerification: {
    status?: string;
    employers?: Array<{
      company: string;
      position: string;
      startDate: Date;
      endDate?: Date;
      verified: boolean;
      discrepancies?: string;
    }>;
  };

  // Education Verification
  @Column({ type: 'jsonb', name: 'education_verification', default: {} })
  educationVerification: {
    status?: string;
    institutions?: Array<{
      name: string;
      degree: string;
      fieldOfStudy: string;
      graduationDate?: Date;
      verified: boolean;
      discrepancies?: string;
    }>;
  };

  // Credit Check
  @Column({ type: 'jsonb', name: 'credit_check', default: {} })
  creditCheck: {
    status?: string;
    result?: string;
    creditScore?: number;
    bankruptcies?: number;
    liens?: number;
    judgments?: number;
    collections?: number;
    details?: string;
  };

  // Drug Screening
  @Column({ type: 'jsonb', name: 'drug_screening', default: {} })
  drugScreening: {
    status?: string;
    result?: string;
    scheduledAt?: Date;
    completedAt?: Date;
    testType?: string;
    facility?: string;
    substances?: string[];
    details?: string;
  };

  // Driving Record
  @Column({ type: 'jsonb', name: 'driving_record', default: {} })
  drivingRecord: {
    status?: string;
    result?: string;
    licenseNumber?: string;
    licenseState?: string;
    violations?: Array<{
      type: string;
      date: Date;
      description: string;
    }>;
    suspensions?: number;
    accidents?: number;
  };

  // Professional License Verification
  @Column({ type: 'jsonb', name: 'professional_licenses', default: {} })
  professionalLicenses: {
    status?: string;
    licenses?: Array<{
      type: string;
      number: string;
      state: string;
      expiryDate?: Date;
      verified: boolean;
      status?: string;
    }>;
  };

  // Identity Verification
  @Column({ type: 'jsonb', name: 'identity_verification', default: {} })
  identityVerification: {
    status?: string;
    result?: string;
    ssnVerified?: boolean;
    addressVerified?: boolean;
    dobVerified?: boolean;
    identityDocuments?: string[];
  };

  // Additional Checks
  @Column({ type: 'jsonb', name: 'additional_checks', default: [] })
  additionalChecks: Array<{
    type: string;
    name: string;
    status: string;
    result?: string;
    details?: any;
  }>;

  // Adverse Actions
  @Column({ type: 'boolean', name: 'has_adverse_findings', default: false })
  hasAdverseFindings: boolean;

  @Column({ type: 'jsonb', name: 'adverse_items', default: [] })
  adverseItems: Array<{
    category: string;
    item: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    source?: string;
  }>;

  @Column({ type: 'boolean', name: 'adverse_action_initiated', default: false })
  adverseActionInitiated: boolean;

  @Column({ type: 'timestamp', name: 'pre_adverse_action_sent_at', nullable: true })
  preAdverseActionSentAt: Date;

  @Column({ type: 'timestamp', name: 'adverse_action_sent_at', nullable: true })
  adverseActionSentAt: Date;

  @Column({ type: 'int', name: 'adverse_action_waiting_period', default: 5 })
  adverseActionWaitingPeriod: number;

  // Disputes
  @Column({ type: 'boolean', name: 'is_disputed', default: false })
  isDisputed: boolean;

  @Column({ type: 'timestamp', name: 'dispute_submitted_at', nullable: true })
  disputeSubmittedAt: Date;

  @Column({ type: 'text', name: 'dispute_reason', nullable: true })
  disputeReason: string;

  @Column({ type: 'varchar', length: 50, name: 'dispute_status', nullable: true })
  disputeStatus: string;

  @Column({ type: 'text', name: 'dispute_resolution', nullable: true })
  disputeResolution: string;

  @Column({ type: 'timestamp', name: 'dispute_resolved_at', nullable: true })
  disputeResolvedAt: Date;

  // Compliance
  @Column({ type: 'boolean', name: 'fcra_compliant', default: true })
  fcraCompliant: boolean;

  @Column({ type: 'jsonb', name: 'compliance_flags', default: [] })
  complianceFlags: string[];

  @Column({ type: 'text', name: 'legal_notes', nullable: true })
  legalNotes: string;

  // Geographies
  @Column({ type: 'jsonb', default: [] })
  countries: string[];

  @Column({ type: 'jsonb', default: [] })
  states: string[];

  @Column({ type: 'jsonb', default: [] })
  counties: string[];

  // Package & Pricing
  @Column({ type: 'varchar', length: 100, name: 'package_name', nullable: true })
  packageName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number;

  @Column({ type: 'varchar', length: 3, nullable: true })
  currency: string;

  // Reports & Documents
  @Column({ type: 'varchar', length: 500, name: 'full_report_url', nullable: true })
  fullReportUrl: string;

  @Column({ type: 'varchar', length: 500, name: 'summary_report_url', nullable: true })
  summaryReportUrl: string;

  @Column({ type: 'jsonb', default: [] })
  documents: Array<{
    id: string;
    type: string;
    name: string;
    url: string;
    uploadedAt: Date;
  }>;

  // Review
  @Column({ type: 'boolean', name: 'requires_review', default: false })
  requiresReview: boolean;

  @Column({ type: 'boolean', name: 'is_reviewed', default: false })
  isReviewed: boolean;

  @Column({ type: 'uuid', name: 'reviewed_by', nullable: true })
  reviewedBy: string;

  @Column({ type: 'timestamp', name: 'reviewed_at', nullable: true })
  reviewedAt: Date;

  @Column({ type: 'text', name: 'reviewer_notes', nullable: true })
  reviewerNotes: string;

  @Column({ type: 'varchar', length: 50, name: 'review_decision', nullable: true })
  reviewDecision: string; // approved, rejected, needs_more_info

  // Integration
  @Column({ type: 'jsonb', name: 'integration_data', default: {} })
  integrationData: {
    providerId?: string;
    webhookData?: any;
    syncStatus?: string;
    lastSyncAt?: Date;
    apiVersion?: string;
  };

  // Notifications
  @Column({ type: 'boolean', name: 'candidate_notified', default: false })
  candidateNotified: boolean;

  @Column({ type: 'timestamp', name: 'candidate_notified_at', nullable: true })
  candidateNotifiedAt: Date;

  @Column({ type: 'boolean', name: 'hiring_team_notified', default: false })
  hiringTeamNotified: boolean;

  // Notes
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', name: 'internal_notes', nullable: true })
  internalNotes: string;

  // Tags
  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  // Audit
  @Column({ type: 'uuid', name: 'created_by' })
  createdBy: string;

  @Column({ type: 'uuid', name: 'updated_by', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
