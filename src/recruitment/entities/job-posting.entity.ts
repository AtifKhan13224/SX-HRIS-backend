import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

/**
 * Job Posting Entity
 * Public/internal job advertisements with multi-channel publishing
 * Enterprise-grade posting management
 */
@Entity('job_postings')
@Index(['companyId', 'status'])
@Index(['requisitionId'])
@Index(['publishedAt'])
export class JobPosting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'company_id' })
  @Index()
  companyId: string;

  @Column({ type: 'uuid', name: 'requisition_id' })
  @Index()
  requisitionId: string;

  @Column({ type: 'varchar', length: 100, name: 'posting_number', unique: true })
  @Index()
  postingNumber: string;

  @Column({ type: 'varchar', length: 200, name: 'job_title' })
  jobTitle: string;

  @Column({ type: 'varchar', length: 500, name: 'job_summary' })
  jobSummary: string;

  @Column({ type: 'text', name: 'job_description' })
  jobDescription: string;

  @Column({ type: 'text', nullable: true })
  responsibilities: string;

  @Column({ type: 'text', nullable: true })
  qualifications: string;

  @Column({ type: 'text', name: 'benefits_overview', nullable: true })
  benefitsOverview: string;

  // Location
  @Column({ type: 'varchar', length: 100 })
  location: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ type: 'varchar', length: 20, name: 'postal_code', nullable: true })
  postalCode: string;

  // Remote Work
  @Column({ type: 'varchar', length: 50, name: 'work_arrangement', default: 'office' })
  workArrangement: string;

  @Column({ type: 'boolean', name: 'is_remote', default: false })
  isRemote: boolean;

  @Column({ type: 'jsonb', name: 'remote_locations', default: [] })
  remoteLocations: string[];

  // Compensation Display
  @Column({ type: 'boolean', name: 'show_salary', default: false })
  showSalary: boolean;

  @Column({ type: 'varchar', length: 200, name: 'salary_range_text', nullable: true })
  salaryRangeText: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'min_salary', nullable: true })
  minSalary: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'max_salary', nullable: true })
  maxSalary: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'varchar', length: 50, name: 'salary_frequency', nullable: true })
  salaryFrequency: string;

  // Job Details
  @Column({ type: 'varchar', length: 50, name: 'employment_type' })
  employmentType: string;

  @Column({ type: 'varchar', length: 50, name: 'job_level' })
  jobLevel: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'jsonb', name: 'keywords', default: [] })
  keywords: string[];

  // Application Settings
  @Column({ type: 'varchar', length: 50, name: 'application_method', default: 'internal' })
  applicationMethod: string; // internal, external_url, email

  @Column({ type: 'varchar', length: 500, name: 'external_application_url', nullable: true })
  externalApplicationUrl: string;

  @Column({ type: 'varchar', length: 200, name: 'application_email', nullable: true })
  applicationEmail: string;

  @Column({ type: 'jsonb', name: 'required_documents', default: [] })
  requiredDocuments: Array<{
    type: string;
    name: string;
    isMandatory: boolean;
  }>;

  @Column({ type: 'jsonb', name: 'application_questions', default: [] })
  applicationQuestions: Array<{
    id: string;
    question: string;
    type: 'text' | 'textarea' | 'select' | 'multiselect' | 'boolean' | 'date' | 'number';
    options?: string[];
    isRequired: boolean;
    order: number;
  }>;

  @Column({ type: 'int', name: 'max_applications', nullable: true })
  maxApplications: number;

  // Screening Questions
  @Column({ type: 'jsonb', name: 'screening_questions', default: [] })
  screeningQuestions: Array<{
    id: string;
    question: string;
    type: string;
    expectedAnswer?: any;
    isKnockout: boolean;
    order: number;
  }>;

  // Visibility
  @Column({ type: 'varchar', length: 50, default: 'draft' })
  @Index()
  status: string; // draft, scheduled, published, paused, closed, expired

  @Column({ type: 'varchar', length: 50, default: 'public' })
  visibility: string; // public, internal, confidential

  @Column({ type: 'boolean', name: 'is_internal_only', default: false })
  isInternalOnly: boolean;

  @Column({ type: 'boolean', name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ type: 'boolean', name: 'is_urgent', default: false })
  isUrgent: boolean;

  // Publishing Channels
  @Column({ type: 'jsonb', name: 'publishing_channels', default: [] })
  publishingChannels: Array<{
    channelId: string;
    channelName: string;
    status: 'pending' | 'published' | 'failed' | 'removed';
    publishedAt?: Date;
    externalPostingId?: string;
    externalPostingUrl?: string;
    cost?: number;
    applicationsReceived?: number;
  }>;

  // SEO
  @Column({ type: 'varchar', length: 200, name: 'seo_title', nullable: true })
  seoTitle: string;

  @Column({ type: 'varchar', length: 500, name: 'seo_description', nullable: true })
  seoDescription: string;

  @Column({ type: 'varchar', length: 200, name: 'slug', unique: true, nullable: true })
  @Index()
  slug: string;

  @Column({ type: 'jsonb', name: 'seo_keywords', default: [] })
  seoKeywords: string[];

  // Dates
  @Column({ type: 'timestamp', name: 'scheduled_publish_at', nullable: true })
  scheduledPublishAt: Date;

  @Column({ type: 'timestamp', name: 'published_at', nullable: true })
  @Index()
  publishedAt: Date;

  @Column({ type: 'timestamp', name: 'expires_at', nullable: true })
  expiresAt: Date;

  @Column({ type: 'timestamp', name: 'closed_at', nullable: true })
  closedAt: Date;

  @Column({ type: 'int', name: 'posting_duration_days', default: 30 })
  postingDurationDays: number;

  // Application Tracking
  @Column({ type: 'int', name: 'views_count', default: 0 })
  viewsCount: number;

  @Column({ type: 'int', name: 'applications_count', default: 0 })
  applicationsCount: number;

  @Column({ type: 'int', name: 'qualified_applications_count', default: 0 })
  qualifiedApplicationsCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'conversion_rate', default: 0 })
  conversionRate: number;

  // Diversity
  @Column({ type: 'boolean', name: 'is_diversity_role', default: false })
  isDiversityRole: boolean;

  @Column({ type: 'text', name: 'diversity_statement', nullable: true })
  diversityStatement: string;

  // EEOC/Compliance
  @Column({ type: 'text', name: 'eeoc_statement', nullable: true })
  eeocStatement: string;

  @Column({ type: 'text', name: 'legal_disclaimer', nullable: true })
  legalDisclaimer: string;

  @Column({ type: 'boolean', name: 'requires_work_authorization', default: false })
  requiresWorkAuthorization: boolean;

  @Column({ type: 'boolean', name: 'visa_sponsorship_available', default: false })
  visaSponsorshipAvailable: boolean;

  // Accessibility
  @Column({ type: 'text', name: 'accessibility_accommodations', nullable: true })
  accessibilityAccommodations: string;

  // Company Branding
  @Column({ type: 'varchar', length: 500, name: 'company_logo_url', nullable: true })
  companyLogoUrl: string;

  @Column({ type: 'varchar', length: 500, name: 'header_image_url', nullable: true })
  headerImageUrl: string;

  @Column({ type: 'text', name: 'company_description', nullable: true })
  companyDescription: string;

  @Column({ type: 'varchar', length: 500, name: 'company_website', nullable: true })
  companyWebsite: string;

  @Column({ type: 'jsonb', name: 'company_social_media', default: {} })
  companySocialMedia: {
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    glassdoor?: string;
    [key: string]: string;
  };

  // Contact Information
  @Column({ type: 'varchar', length: 200, name: 'contact_name', nullable: true })
  contactName: string;

  @Column({ type: 'varchar', length: 200, name: 'contact_email', nullable: true })
  contactEmail: string;

  @Column({ type: 'varchar', length: 50, name: 'contact_phone', nullable: true })
  contactPhone: string;

  // Analytics
  @Column({ type: 'jsonb', name: 'source_tracking', default: {} })
  sourceTracking: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    [key: string]: any;
  };

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'total_cost', default: 0 })
  totalCost: number;

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
