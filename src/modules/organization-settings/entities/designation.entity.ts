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

@Entity('designations')
export class Designation {
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
  designationCode: string;

  @Column({ length: 200 })
  designationTitle: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 100, nullable: true })
  shortTitle: string;

  @Column({ length: 20, nullable: true })
  abbreviation: string;

  // Classification & Status
  @Column({ length: 50, nullable: true })
  status: string; // Active, Inactive, Suspended, Pending Approval, Draft

  @Column({ length: 50, nullable: true })
  designationType: string; // Regular, Acting, Temporary, Interim, Project-based, Contract

  @Column({ type: 'date', nullable: true })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isPrimary: boolean; // Is this the primary designation for the employee

  @Column({ default: false })
  isActing: boolean; // Acting in this role

  @Column({ default: false })
  isTemporary: boolean;

  // Assignment Details
  @Column({ nullable: true })
  employeeId: string; // Reference to employee

  @Column({ nullable: true })
  positionId: string; // Reference to position

  @Column({ nullable: true })
  departmentId: string;

  @Column({ nullable: true })
  divisionId: string;

  @Column({ nullable: true })
  businessUnitId: string;

  @Column({ nullable: true })
  locationId: string;

  @Column({ nullable: true })
  costCenterId: string;

  // Reporting Structure
  @Column({ nullable: true })
  reportingToDesignationId: string;

  @Column({ nullable: true })
  reportingToEmployeeId: string;

  @Column({ length: 100, nullable: true })
  reportingRelationship: string; // Direct, Dotted, Matrix, Functional, Administrative

  @Column({ default: 0 })
  directReportsCount: number;

  @Column({ default: 0 })
  indirectReportsCount: number;

  @Column({ default: 0 })
  totalTeamSize: number;

  @Column({ length: 100, nullable: true })
  supervisoryLevel: string; // None, First-Level, Mid-Level, Senior-Level, Executive

  // Compensation & Grade
  @Column({ nullable: true })
  gradeId: string;

  @Column({ nullable: true })
  bandId: string;

  @Column({ nullable: true })
  levelId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  baseSalary: number;

  @Column({ length: 10, nullable: true })
  salaryCurrency: string;

  @Column({ length: 50, nullable: true })
  payFrequency: string; // Monthly, Bi-Weekly, Weekly, Annual

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  bonusPercentage: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  targetBonus: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  actualBonus: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalCompensation: number;

  // Employment Terms
  @Column({ length: 50, nullable: true })
  employmentType: string; // Full-Time, Part-Time, Contract, Temporary, Intern, Consultant

  @Column({ length: 50, nullable: true })
  workArrangement: string; // On-Site, Remote, Hybrid, Field-Based

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  ftePercentage: number; // Full-Time Equivalent percentage

  @Column({ default: 40 })
  hoursPerWeek: number;

  @Column({ default: false })
  isExempt: boolean; // Exempt from overtime

  // Responsibilities & Scope
  @Column({ type: 'text', nullable: true })
  keyResponsibilities: string;

  @Column({ type: 'jsonb', nullable: true })
  responsibilities: any[]; // Array of responsibility objects

  @Column({ type: 'text', nullable: true })
  decisionAuthority: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  budgetAuthority: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  revenueResponsibility: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  profitLossResponsibility: number;

  @Column({ type: 'simple-array', nullable: true })
  functionalResponsibilities: string[];

  // Performance & Goals
  @Column({ type: 'jsonb', nullable: true })
  performanceGoals: any; // Performance objectives and KPIs

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  currentPerformanceRating: number; // 0-5 scale

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  lastPerformanceRating: number;

  @Column({ type: 'date', nullable: true })
  lastPerformanceReview: Date;

  @Column({ type: 'date', nullable: true })
  nextPerformanceReview: Date;

  @Column({ type: 'simple-array', nullable: true })
  kpis: string[]; // Key Performance Indicators

  // Skills & Competencies
  @Column({ type: 'simple-array', nullable: true })
  requiredSkills: string[];

  @Column({ type: 'simple-array', nullable: true })
  preferredSkills: string[];

  @Column({ type: 'simple-array', nullable: true })
  certifications: string[];

  @Column({ type: 'simple-array', nullable: true })
  languages: string[];

  @Column({ type: 'jsonb', nullable: true })
  competencyProfile: any; // Competency assessment data

  // Career & Development
  @Column({ type: 'date', nullable: true })
  dateAssigned: Date;

  @Column({ type: 'date', nullable: true })
  dateEnded: Date;

  @Column({ default: 0 })
  tenureMonths: number;

  @Column({ nullable: true })
  previousDesignationId: string;

  @Column({ type: 'jsonb', nullable: true })
  careerHistory: any[]; // Previous designations

  @Column({ type: 'jsonb', nullable: true })
  developmentPlan: any; // Career development plan

  @Column({ type: 'simple-array', nullable: true })
  successionCandidates: string[]; // Employee IDs

  // Work Conditions
  @Column({ default: false })
  requiresTravel: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  travelPercentage: number;

  @Column({ default: false })
  requiresShiftWork: boolean;

  @Column({ length: 50, nullable: true })
  shiftPattern: string;

  @Column({ default: false })
  requiresOnsitePresence: boolean;

  @Column({ default: false })
  hasFlexibleHours: boolean;

  // Compliance & Requirements
  @Column({ type: 'simple-array', nullable: true })
  complianceRequirements: string[];

  @Column({ length: 50, nullable: true })
  backgroundCheckStatus: string; // Not Required, Pending, Completed, Failed

  @Column({ type: 'date', nullable: true })
  backgroundCheckDate: Date;

  @Column({ type: 'simple-array', nullable: true })
  securityClearances: string[];

  @Column({ type: 'simple-array', nullable: true })
  licenses: string[];

  @Column({ type: 'date', nullable: true })
  licenseExpiryDate: Date;

  // Contract & Legal
  @Column({ nullable: true })
  contractId: string;

  @Column({ type: 'date', nullable: true })
  contractStartDate: Date;

  @Column({ type: 'date', nullable: true })
  contractEndDate: Date;

  @Column({ default: false })
  isContingent: boolean; // Contingent worker

  @Column({ length: 100, nullable: true })
  employmentStatus: string; // Regular, Probation, Notice Period, Extended, Renewed

  @Column({ nullable: true })
  sponsoringCompanyId: string;

  @Column({ length: 100, nullable: true })
  legalEntity: string;

  // Approval & Workflow
  @Column({ length: 50, nullable: true })
  approvalStatus: string; // Draft, Pending, Approved, Rejected, Revised

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedDate: Date;

  @Column({ type: 'text', nullable: true })
  approvalComments: string;

  @Column({ nullable: true })
  requestedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  requestedDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  approvalWorkflow: any; // Workflow tracking

  // Job Description
  @Column({ nullable: true })
  jobDescriptionId: string;

  @Column({ type: 'text', nullable: true })
  jobSummary: string;

  @Column({ type: 'text', nullable: true })
  qualifications: string;

  @Column({ type: 'text', nullable: true })
  educationRequirements: string;

  @Column({ type: 'text', nullable: true })
  experienceRequirements: string;

  // Location & Work Setup
  @Column({ length: 100, nullable: true })
  workLocation: string;

  @Column({ length: 100, nullable: true })
  officeLocation: string;

  @Column({ length: 50, nullable: true })
  floorNumber: string;

  @Column({ length: 50, nullable: true })
  seatNumber: string;

  @Column({ length: 100, nullable: true })
  timeZone: string;

  @Column({ type: 'simple-array', nullable: true })
  workLocations: string[]; // Multiple work locations

  // Communication
  @Column({ length: 100, nullable: true })
  workEmail: string;

  @Column({ length: 50, nullable: true })
  workPhone: string;

  @Column({ length: 50, nullable: true })
  extension: string;

  @Column({ length: 50, nullable: true })
  mobileNumber: string;

  // Analytics & Tracking
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  utilizationRate: number; // Percentage of productive work

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  productivityScore: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  costToCompany: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  revenueGenerated: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  employeeRetentionRisk: number; // Risk score

  @Column({ default: 0 })
  daysInRole: number;

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
