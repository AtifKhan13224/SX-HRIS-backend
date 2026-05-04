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

@Entity('sponsoring_companies')
export class SponsoringCompany {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relations
  @Column({ name: 'group_company_id', nullable: true })
  groupCompanyId: string;

  @ManyToOne(() => GroupCompany)
  @JoinColumn({ name: 'group_company_id' })
  groupCompany: GroupCompany;

  // Basic Information
  @Column({ unique: true, length: 50 })
  companyCode: string;

  @Column({ length: 200 })
  companyName: string;

  @Column({ length: 200, nullable: true })
  legalName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 100, nullable: true })
  shortName: string;

  @Column({ length: 20, nullable: true })
  abbreviation: string;

  // Legal & Registration
  @Column({ length: 100, nullable: true })
  registrationNumber: string;

  @Column({ length: 100, nullable: true })
  taxId: string;

  @Column({ length: 100, nullable: true })
  vatNumber: string;

  @Column({ length: 100, nullable: true })
  incorporationNumber: string;

  @Column({ type: 'date', nullable: true })
  incorporationDate: Date;

  @Column({ length: 100, nullable: true })
  jurisdictionOfIncorporation: string;

  @Column({ length: 100, nullable: true })
  companyType: string; // LLC, Corporation, Partnership, Sole Proprietorship

  @Column({ length: 100, nullable: true })
  legalStatus: string; // Active, Inactive, Dissolved, Merged

  // Location & Contact
  @Column({ length: 100, nullable: true })
  country: string;

  @Column({ length: 100, nullable: true })
  registeredAddress: string;

  @Column({ length: 100, nullable: true })
  businessAddress: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  state: string;

  @Column({ length: 20, nullable: true })
  postalCode: string;

  @Column({ length: 50, nullable: true })
  phoneNumber: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 200, nullable: true })
  website: string;

  // Sponsorship & Visa Management
  @Column({ default: true })
  canSponsorVisa: boolean;

  @Column({ default: false })
  hasH1BSponsor: boolean;

  @Column({ default: false })
  hasL1Sponsor: boolean;

  @Column({ default: false })
  hasE3Sponsor: boolean;

  @Column({ default: false })
  hasTN1Sponsor: boolean;

  @Column({ type: 'simple-array', nullable: true })
  supportedVisaTypes: string[];

  @Column({ type: 'int', nullable: true })
  annualH1BCap: number;

  @Column({ type: 'int', nullable: true })
  usedH1BCount: number;

  @Column({ type: 'int', nullable: true })
  remainingH1BCount: number;

  @Column({ type: 'simple-array', nullable: true })
  sponsorshipCountries: string[]; // Countries where sponsorship is available

  // Immigration Compliance
  @Column({ default: false })
  isEVerifyEnrolled: boolean;

  @Column({ length: 100, nullable: true })
  eVerifyNumber: string;

  @Column({ type: 'date', nullable: true })
  eVerifyEnrollmentDate: Date;

  @Column({ default: false })
  hasI9Compliance: boolean;

  @Column({ default: false })
  hasLCACompliance: boolean; // Labor Condition Application

  @Column({ type: 'simple-array', nullable: true })
  complianceCertifications: string[];

  // Work Permit Management
  @Column({ type: 'int', nullable: true })
  activeWorkPermits: number;

  @Column({ type: 'int', nullable: true })
  pendingWorkPermits: number;

  @Column({ type: 'int', nullable: true })
  expiringWorkPermits: number;

  @Column({ type: 'jsonb', nullable: true })
  workPermitStats: any; // Detailed work permit statistics

  // Sponsorship Costs
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  averageH1BCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  averageGreenCardCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalSponsorshipCost: number; // Annual

  @Column({ length: 10, nullable: true })
  sponsorshipCurrency: string;

  @Column({ type: 'jsonb', nullable: true })
  costBreakdown: any; // Detailed cost breakdown

  // Legal Representation
  @Column({ length: 200, nullable: true })
  immigrationAttorney: string;

  @Column({ length: 200, nullable: true })
  lawFirm: string;

  @Column({ length: 100, nullable: true })
  attorneyEmail: string;

  @Column({ length: 50, nullable: true })
  attorneyPhone: string;

  @Column({ type: 'simple-array', nullable: true })
  legalContacts: string[];

  // Business Operations
  @Column({ length: 100, nullable: true })
  industry: string;

  @Column({ length: 100, nullable: true })
  primaryBusinessActivity: string;

  @Column({ type: 'simple-array', nullable: true })
  businessActivities: string[];

  @Column({ type: 'int', nullable: true })
  numberOfEmployees: number;

  @Column({ type: 'int', nullable: true })
  numberOfForeignNationals: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  annualRevenue: number;

  @Column({ length: 10, nullable: true })
  revenueCurrency: string;

  // Regulatory & Compliance
  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isApproved: boolean;

  @Column({ default: false })
  isPrimarySponsorship: boolean;

  @Column({ type: 'simple-array', nullable: true })
  regulatoryRequirements: string[];

  @Column({ type: 'simple-array', nullable: true })
  complianceDocuments: string[];

  @Column({ type: 'date', nullable: true })
  lastComplianceReview: Date;

  @Column({ type: 'date', nullable: true })
  nextComplianceReview: Date;

  @Column({ length: 50, nullable: true })
  complianceStatus: string; // Compliant, Non-Compliant, Under Review

  // Financial Information
  @Column({ type: 'simple-array', nullable: true })
  bankAccounts: string[];

  @Column({ length: 100, nullable: true })
  defaultPayrollProvider: string;

  @Column({ length: 100, nullable: true })
  defaultBenefitsProvider: string;

  @Column({ type: 'jsonb', nullable: true })
  financialDetails: any;

  // Dates & Timeline
  @Column({ type: 'date', nullable: true })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ type: 'date', nullable: true })
  lastAuditDate: Date;

  @Column({ type: 'date', nullable: true })
  nextAuditDate: Date;

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

  // Statistics & Analytics
  @Column({ type: 'int', nullable: true })
  totalSponsored: number; // Historical count

  @Column({ type: 'int', nullable: true })
  activeSponsored: number;

  @Column({ type: 'int', nullable: true })
  approvedPetitions: number;

  @Column({ type: 'int', nullable: true })
  deniedPetitions: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  approvalRate: number; // Percentage

  @Column({ type: 'jsonb', nullable: true })
  sponsorshipHistory: any[]; // Historical data

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
