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

@Entity('jd_templates')
export class JDTemplate {
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
  templateCode: string;

  @Column({ length: 200 })
  templateName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 100, nullable: true })
  category: string; // Executive, Management, Professional, Technical, Administrative

  @Column({ length: 100, nullable: true })
  templateType: string; // Standard, Premium, Custom, Industry-Specific

  @Column({ length: 50, nullable: true })
  version: string;

  // Job Description Sections
  @Column({ type: 'text', nullable: true })
  jobTitle: string;

  @Column({ type: 'text', nullable: true })
  jobSummary: string;

  @Column({ type: 'text', nullable: true })
  jobOverview: string;

  @Column({ type: 'text', nullable: true })
  keyResponsibilities: string;

  @Column({ type: 'jsonb', nullable: true })
  responsibilities: any[]; // Structured responsibilities

  @Column({ type: 'text', nullable: true })
  qualifications: string;

  @Column({ type: 'text', nullable: true })
  educationRequirements: string;

  @Column({ type: 'text', nullable: true })
  experienceRequirements: string;

  @Column({ type: 'simple-array', nullable: true })
  requiredSkills: string[];

  @Column({ type: 'simple-array', nullable: true })
  preferredSkills: string[];

  @Column({ type: 'simple-array', nullable: true })
  certifications: string[];

  // Additional Sections
  @Column({ type: 'text', nullable: true })
  workingConditions: string;

  @Column({ type: 'text', nullable: true })
  physicalRequirements: string;

  @Column({ type: 'text', nullable: true })
  travelRequirements: string;

  @Column({ type: 'text', nullable: true })
  benefitsPackage: string;

  @Column({ type: 'text', nullable: true })
  compensationRange: string;

  @Column({ type: 'text', nullable: true })
  careerPath: string;

  @Column({ type: 'text', nullable: true })
  companyOverview: string;

  @Column({ type: 'text', nullable: true })
  equalOpportunityStatement: string;

  // Template Settings
  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ default: false })
  isApproved: boolean;

  @Column({ default: false })
  isStandard: boolean; // Standard template

  @Column({ default: false })
  isCustomizable: boolean;

  @Column({ default: false })
  requiresApproval: boolean;

  // Content Structure
  @Column({ type: 'jsonb', nullable: true })
  sections: any[]; // Structured sections

  @Column({ type: 'jsonb', nullable: true })
  layout: any; // Layout configuration

  @Column({ type: 'simple-array', nullable: true })
  includedSections: string[];

  @Column({ type: 'simple-array', nullable: true })
  optionalSections: string[];

  // Branding & Style
  @Column({ type: 'jsonb', nullable: true })
  styling: any; // CSS/styling rules

  @Column({ type: 'simple-array', nullable: true })
  brandingElements: string[];

  @Column({ length: 100, nullable: true })
  headerTemplate: string;

  @Column({ length: 100, nullable: true })
  footerTemplate: string;

  @Column({ length: 200, nullable: true })
  logoUrl: string;

  // Usage & Analytics
  @Column({ default: 0 })
  usageCount: number;

  @Column({ default: 0 })
  activeUsageCount: number;

  @Column({ type: 'date', nullable: true })
  lastUsedDate: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  averageRating: number;

  @Column({ type: 'int', nullable: true })
  totalRatings: number;

  // Approval Workflow
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

  // Version Control
  @Column({ type: 'jsonb', nullable: true })
  versionHistory: any[];

  @Column({ type: 'date', nullable: true })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ nullable: true })
  previousVersionId: string;

  @Column({ nullable: true })
  parentTemplateId: string;

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
