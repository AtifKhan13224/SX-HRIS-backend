import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Candidate Entity
 * Central talent database with GDPR compliance
 * Enterprise-grade candidate management
 */
@Entity('candidates')
@Index(['companyId', 'status'])
@Index(['email'])
@Index(['phoneNumber'])
@Index(['source'])
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'company_id' })
  @Index()
  companyId: string;

  @Column({ type: 'varchar', length: 100, name: 'candidate_number', unique: true })
  @Index()
  candidateNumber: string;

  // Personal Information
  @Column({ type: 'varchar', length: 100, name: 'first_name' })
  firstName: string;

  @Column({ type: 'varchar', length: 100, name: 'middle_name', nullable: true })
  middleName: string;

  @Column({ type: 'varchar', length: 100, name: 'last_name' })
  lastName: string;

  @Column({ type: 'varchar', length: 50, name: 'preferred_name', nullable: true })
  preferredName: string;

  @Column({ type: 'varchar', length: 200, unique: true })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 200, name: 'secondary_email', nullable: true })
  secondaryEmail: string;

  @Column({ type: 'varchar', length: 50, name: 'phone_number' })
  @Index()
  phoneNumber: string;

  @Column({ type: 'varchar', length: 50, name: 'alternate_phone', nullable: true })
  alternatePhone: string;

  @Column({ type: 'date', name: 'date_of_birth', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  gender: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nationality: string;

  // Address
  @Column({ type: 'text', name: 'address_line1', nullable: true })
  addressLine1: string;

  @Column({ type: 'text', name: 'address_line2', nullable: true })
  addressLine2: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ type: 'varchar', length: 20, name: 'postal_code', nullable: true })
  postalCode: string;

  // Professional Information
  @Column({ type: 'varchar', length: 200, name: 'current_title', nullable: true })
  currentTitle: string;

  @Column({ type: 'varchar', length: 200, name: 'current_employer', nullable: true })
  currentEmployer: string;

  @Column({ type: 'int', name: 'years_of_experience', default: 0 })
  yearsOfExperience: number;

  @Column({ type: 'varchar', length: 100, name: 'highest_education', nullable: true })
  highestEducation: string;

  @Column({ type: 'varchar', length: 200, name: 'field_of_study', nullable: true })
  fieldOfStudy: string;

  @Column({ type: 'jsonb', default: [] })
  skills: Array<{
    skillId?: string;
    skillName: string;
    level?: string;
    yearsOfExperience?: number;
    endorsements?: number;
  }>;

  @Column({ type: 'jsonb', default: [] })
  languages: Array<{
    language: string;
    proficiency: 'basic' | 'intermediate' | 'fluent' | 'native';
    canRead: boolean;
    canWrite: boolean;
    canSpeak: boolean;
  }>;

  @Column({ type: 'jsonb', default: [] })
  certifications: Array<{
    name: string;
    issuingOrganization: string;
    issueDate?: Date;
    expiryDate?: Date;
    credentialId?: string;
    credentialUrl?: string;
  }>;

  // Resume/CV
  @Column({ type: 'varchar', length: 500, name: 'resume_url', nullable: true })
  resumeUrl: string;

  @Column({ type: 'varchar', length: 255, name: 'resume_filename', nullable: true })
  resumeFilename: string;

  @Column({ type: 'timestamp', name: 'resume_uploaded_at', nullable: true })
  resumeUploadedAt: Date;

  @Column({ type: 'text', name: 'resume_text', nullable: true })
  resumeText: string; // Parsed text for searching

  @Column({ type: 'jsonb', name: 'parsed_resume', default: {} })
  parsedResume: {
    education?: any[];
    experience?: any[];
    skills?: string[];
    certifications?: any[];
    summary?: string;
    [key: string]: any;
  };

  // Additional Documents
  @Column({ type: 'jsonb', default: [] })
  documents: Array<{
    id: string;
    type: string;
    name: string;
    url: string;
    uploadedAt: Date;
  }>;

  // Portfolio
  @Column({ type: 'varchar', length: 500, name: 'portfolio_url', nullable: true })
  portfolioUrl: string;

  @Column({ type: 'varchar', length: 500, name: 'linkedin_url', nullable: true })
  linkedinUrl: string;

  @Column({ type: 'varchar', length: 500, name: 'github_url', nullable: true })
  githubUrl: string;

  @Column({ type: 'jsonb', name: 'social_profiles', default: {} })
  socialProfiles: {
    twitter?: string;
    facebook?: string;
    stackoverflow?: string;
    website?: string;
    [key: string]: string;
  };

  // Source
  @Column({ type: 'varchar', length: 100 })
  @Index()
  source: string; // Career Site, Referral, LinkedIn, Indeed, Agency, etc.

  @Column({ type: 'varchar', length: 100, name: 'source_detail', nullable: true })
  sourceDetail: string;

  @Column({ type: 'uuid', name: 'referrer_id', nullable: true })
  referrerId: string;

  @Column({ type: 'varchar', length: 200, name: 'referrer_name', nullable: true })
  referrerName: string;

  // Status
  @Column({ type: 'varchar', length: 50, default: 'new' })
  @Index()
  status: string; // new, active, interviewing, offered, hired, rejected, withdrawn, on_hold, blacklisted

  @Column({ type: 'varchar', length: 50, name: 'availability_status', default: 'available' })
  availabilityStatus: string; // available, employed, not_looking, passive

  @Column({ type: 'date', name: 'available_from', nullable: true })
  availableFrom: Date;

  @Column({ type: 'int', name: 'notice_period_days', nullable: true })
  noticePeriodDays: number;

  // Salary Expectations
  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'expected_salary', nullable: true })
  expectedSalary: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'current_salary', nullable: true })
  currentSalary: number;

  @Column({ type: 'varchar', length: 3, name: 'salary_currency', default: 'USD' })
  salaryCurrency: string;

  @Column({ type: 'varchar', length: 50, name: 'salary_frequency', nullable: true })
  salaryFrequency: string;

  @Column({ type: 'boolean', name: 'salary_negotiable', default: true })
  salaryNegotiable: boolean;

  // Preferences
  @Column({ type: 'jsonb', name: 'preferred_locations', default: [] })
  preferredLocations: string[];

  @Column({ type: 'jsonb', name: 'preferred_job_types', default: [] })
  preferredJobTypes: string[]; // Full-Time, Part-Time, Contract, etc.

  @Column({ type: 'varchar', length: 50, name: 'preferred_work_arrangement', nullable: true })
  preferredWorkArrangement: string; // office, remote, hybrid

  @Column({ type: 'boolean', name: 'willing_to_relocate', default: false })
  willingToRelocate: boolean;

  @Column({ type: 'boolean', name: 'willing_to_travel', default: false })
  willingToTravel: boolean;

  @Column({ type: 'int', name: 'travel_percentage_willing', nullable: true })
  travelPercentageWilling: number;

  // Work Authorization
  @Column({ type: 'varchar', length: 100, name: 'work_authorization', nullable: true })
  workAuthorization: string;

  @Column({ type: 'boolean', name: 'requires_visa_sponsorship', default: false })
  requiresVisaSponsorship: boolean;

  @Column({ type: 'jsonb', name: 'visa_status', default: {} })
  visaStatus: {
    type?: string;
    expiryDate?: Date;
    country?: string;
  };

  // Diversity (Optional - with consent)
  @Column({ type: 'jsonb', name: 'diversity_info', default: {} })
  diversityInfo: {
    ethnicity?: string;
    veteranStatus?: string;
    disabilityStatus?: string;
    gender?: string;
    [key: string]: any;
  };

  @Column({ type: 'boolean', name: 'diversity_consent_given', default: false })
  diversityConsentGiven: boolean;

  // Ratings
  @Column({ type: 'decimal', precision: 3, scale: 2, name: 'overall_rating', nullable: true })
  overallRating: number;

  @Column({ type: 'jsonb', name: 'skill_ratings', default: {} })
  skillRatings: Record<string, number>;

  @Column({ type: 'int', name: 'interview_score', nullable: true })
  interviewScore: number;

  @Column({ type: 'int', name: 'assessment_score', nullable: true })
  assessmentScore: number;

  // Talent Pool
  @Column({ type: 'jsonb', name: 'talent_pool_ids', default: [] })
  talentPoolIds: string[];

  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  // Communication
  @Column({ type: 'varchar', length: 50, name: 'preferred_contact_method', default: 'email' })
  preferredContactMethod: string;

  @Column({ type: 'varchar', length: 100, name: 'preferred_contact_time', nullable: true })
  preferredContactTime: string;

  @Column({ type: 'varchar', length: 50, name: 'timezone', nullable: true })
  timezone: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // GDPR Compliance
  @Column({ type: 'boolean', name: 'gdpr_consent', default: false })
  gdprConsent: boolean;

  @Column({ type: 'timestamp', name: 'gdpr_consent_date', nullable: true })
  gdprConsentDate: Date;

  @Column({ type: 'boolean', name: 'marketing_consent', default: false })
  marketingConsent: boolean;

  @Column({ type: 'date', name: 'data_retention_date', nullable: true })
  dataRetentionDate: Date;

  @Column({ type: 'boolean', name: 'right_to_be_forgotten_requested', default: false })
  rightToBeForgottenRequested: boolean;

  @Column({ type: 'timestamp', name: 'data_deletion_scheduled_at', nullable: true })
  dataDeletionScheduledAt: Date;

  // Security
  @Column({ type: 'boolean', name: 'is_blacklisted', default: false })
  isBlacklisted: boolean;

  @Column({ type: 'text', name: 'blacklist_reason', nullable: true })
  blacklistReason: string;

  @Column({ type: 'boolean', name: 'is_duplicate', default: false })
  isDuplicate: boolean;

  @Column({ type: 'uuid', name: 'primary_candidate_id', nullable: true })
  primaryCandidateId: string;

  // Analytics
  @Column({ type: 'int', name: 'applications_count', default: 0 })
  applicationsCount: number;

  @Column({ type: 'int', name: 'interviews_count', default: 0 })
  interviewsCount: number;

  @Column({ type: 'int', name: 'offers_count', default: 0 })
  offersCount: number;

  @Column({ type: 'timestamp', name: 'last_contacted_at', nullable: true })
  lastContactedAt: Date;

  @Column({ type: 'timestamp', name: 'last_activity_at', nullable: true })
  lastActivityAt: Date;

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
