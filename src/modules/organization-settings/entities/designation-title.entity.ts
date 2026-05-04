import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GroupCompany } from './group-company.entity';
import { DesignationName } from './designation-name.entity';

@Entity('designation_titles')
export class DesignationTitle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relations
  @Column({ name: 'group_company_id', nullable: true })
  groupCompanyId: string;

  @ManyToOne(() => GroupCompany)
  @JoinColumn({ name: 'group_company_id' })
  groupCompany: GroupCompany;

  @Column({ name: 'designation_name_id', nullable: true })
  designationNameId: string;

  @ManyToOne(() => DesignationName)
  @JoinColumn({ name: 'designation_name_id' })
  designationName: DesignationName;

  // Basic Information
  @Column({ unique: true, length: 50 })
  titleCode: string;

  @Column({ length: 200 })
  titleName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 100, nullable: true })
  shortTitle: string;

  @Column({ length: 20, nullable: true })
  abbreviation: string;

  // Title Classification
  @Column({ length: 50, nullable: true })
  titleType: string; // Primary, Alternative, Internal, External, Marketing, Legal

  @Column({ length: 50, nullable: true })
  titleContext: string; // Job Posting, Business Card, Email Signature, Organization Chart, Legal Documents

  @Column({ default: false })
  isPrimary: boolean;

  @Column({ default: false })
  isInternal: boolean; // Used internally only

  @Column({ default: false })
  isExternal: boolean; // Used for external communications

  @Column({ default: false })
  isLegal: boolean; // Legal/Official title

  @Column({ default: false })
  isMarketing: boolean; // Marketing/Branding title

  // Language & Localization
  @Column({ length: 10, nullable: true })
  languageCode: string; // en, es, fr, de, zh, ja, etc.

  @Column({ length: 100, nullable: true })
  locale: string; // en-US, en-GB, es-MX, fr-FR, etc.

  @Column({ type: 'jsonb', nullable: true })
  translations: Record<string, string>; // { "en": "...", "es": "...", "fr": "..." }

  @Column({ type: 'simple-array', nullable: true })
  alternativeNames: string[];

  @Column({ type: 'simple-array', nullable: true })
  synonyms: string[];

  // Geographic Scope
  @Column({ length: 100, nullable: true })
  region: string; // North America, Europe, Asia Pacific, etc.

  @Column({ length: 100, nullable: true })
  country: string;

  @Column({ length: 100, nullable: true })
  state: string;

  @Column({ type: 'simple-array', nullable: true })
  applicableRegions: string[];

  @Column({ type: 'simple-array', nullable: true })
  applicableCountries: string[];

  @Column({ length: 50, nullable: true })
  geographicScope: string; // Global, Regional, Country-Specific, Local

  // Industry & Market Context
  @Column({ length: 100, nullable: true })
  industry: string;

  @Column({ type: 'simple-array', nullable: true })
  targetIndustries: string[];

  @Column({ type: 'simple-array', nullable: true })
  marketSegments: string[];

  @Column({ length: 50, nullable: true })
  seniorityLevel: string; // Entry, Mid, Senior, Executive, C-Level

  // Usage & Application
  @Column({ type: 'simple-array', nullable: true })
  usageContexts: string[]; // [Job Posting, Business Card, Email, Org Chart, etc.]

  @Column({ type: 'text', nullable: true })
  usageGuidelines: string;

  @Column({ type: 'text', nullable: true })
  usageRestrictions: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isDeprecated: boolean;

  @Column({ default: false })
  isPreferred: boolean; // Preferred title variant

  // Branding & Communication
  @Column({ type: 'text', nullable: true })
  brandingGuidelines: string;

  @Column({ type: 'text', nullable: true })
  communicationGuidelines: string;

  @Column({ length: 500, nullable: true })
  externalDescription: string; // For job postings, marketing

  @Column({ length: 500, nullable: true })
  internalDescription: string; // For internal use

  @Column({ type: 'simple-array', nullable: true })
  keywords: string[]; // SEO keywords

  @Column({ type: 'simple-array', nullable: true })
  searchTerms: string[]; // Search optimization

  // Competitor Mapping
  @Column({ type: 'jsonb', nullable: true })
  competitorEquivalents: any[]; // [{ company: "...", title: "...", similarity: 90 }]

  @Column({ type: 'simple-array', nullable: true })
  industryEquivalents: string[];

  @Column({ type: 'simple-array', nullable: true })
  commonVariations: string[];

  // Hierarchy & Level
  @Column({ type: 'int', nullable: true })
  levelNumber: number; // 1-10

  @Column({ length: 50, nullable: true })
  hierarchyLevel: string; // C-Level, VP, Director, Manager, Individual Contributor

  @Column({ default: false })
  isExecutive: boolean;

  @Column({ default: false })
  isManagement: boolean;

  @Column({ default: false })
  isLeadership: boolean;

  @Column({ default: false })
  isSupervisory: boolean;

  // Legal & Compliance
  @Column({ type: 'simple-array', nullable: true })
  legalRequirements: string[];

  @Column({ type: 'simple-array', nullable: true })
  complianceNotes: string[];

  @Column({ type: 'simple-array', nullable: true })
  regulatoryConsiderations: string[];

  @Column({ default: false })
  requiresLegalApproval: boolean;

  @Column({ default: false })
  isProtectedTitle: boolean; // Legally protected title

  // History & Versioning
  @Column({ type: 'date', nullable: true })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ nullable: true })
  previousTitleId: string; // Previous version

  @Column({ nullable: true })
  replacedBy: string; // Replaced by this title

  @Column({ type: 'jsonb', nullable: true })
  versionHistory: any[]; // Change history

  @Column({ type: 'text', nullable: true })
  changeReason: string;

  @Column({ type: 'date', nullable: true })
  lastReviewDate: Date;

  @Column({ type: 'date', nullable: true })
  nextReviewDate: Date;

  // Usage Analytics
  @Column({ default: 0 })
  usageCount: number; // How many times used

  @Column({ default: 0 })
  activeUsageCount: number; // Currently active uses

  @Column({ type: 'date', nullable: true })
  lastUsedDate: Date;

  @Column({ type: 'date', nullable: true })
  firstUsedDate: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  popularityScore: number; // 0-100

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  preferenceScore: number; // User preference score

  // Market Intelligence
  @Column({ length: 50, nullable: true })
  marketTrend: string; // Growing, Stable, Declining, Emerging

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  marketAdoptionRate: number; // Percentage

  @Column({ type: 'date', nullable: true })
  trendAnalysisDate: Date;

  @Column({ type: 'simple-array', nullable: true })
  emergingAlternatives: string[];

  // SEO & Discoverability
  @Column({ length: 500, nullable: true })
  metaTitle: string;

  @Column({ type: 'text', nullable: true })
  metaDescription: string;

  @Column({ type: 'simple-array', nullable: true })
  searchKeywords: string[];

  @Column({ type: 'jsonb', nullable: true })
  seoMetadata: any;

  // Approval & Workflow
  @Column({ length: 50, nullable: true })
  approvalStatus: string; // Draft, Pending, Approved, Rejected

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedDate: Date;

  @Column({ type: 'text', nullable: true })
  approvalComments: string;

  @Column({ type: 'jsonb', nullable: true })
  approvalWorkflow: any;

  // Migration & Integration
  @Column({ length: 100, nullable: true })
  sourceSystem: string; // Where this title came from

  @Column({ length: 100, nullable: true })
  externalId: string; // ID in external system

  @Column({ type: 'jsonb', nullable: true })
  integrationMetadata: any;

  @Column({ default: false })
  isMigrated: boolean;

  @Column({ type: 'date', nullable: true })
  migrationDate: Date;

  // Character & Display
  @Column({ default: 0 })
  characterCount: number;

  @Column({ default: 0 })
  wordCount: number;

  @Column({ default: false })
  hasSpecialCharacters: boolean;

  @Column({ default: false })
  hasNumbers: boolean;

  @Column({ default: false })
  isAllCaps: boolean;

  @Column({ default: false })
  isTitleCase: boolean;

  // Metadata
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  internalNotes: string;

  @Column({ type: 'jsonb', nullable: true })
  customFields: any;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'simple-array', nullable: true })
  categories: string[];

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
