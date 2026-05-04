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

@Entity('positions')
export class Position {
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
  positionCode: string;

  @Column({ length: 200 })
  positionTitle: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 100, nullable: true })
  shortTitle: string;

  @Column({ length: 20, nullable: true })
  abbreviation: string;

  // Position Status & Control
  @Column({ length: 50, nullable: true })
  positionStatus: string; // Vacant, Filled, Frozen, Pending Approval, In Review, Abolished

  @Column({ length: 50, nullable: true })
  positionType: string; // Regular, Project-Based, Temporary, Contract, Intern, Consultant

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isVacant: boolean;

  @Column({ default: false })
  isFrozen: boolean;

  @Column({ default: false })
  isPendingApproval: boolean;

  @Column({ default: false })
  isApproved: boolean;

  @Column({ default: false })
  isBudgeted: boolean;

  @Column({ default: false })
  isEssential: boolean; // Business-critical position

  // Organizational Structure
  @Column({ nullable: true })
  departmentId: string;

  @Column({ nullable: true })
  divisionId: string;

  @Column({ nullable: true })
  businessUnitId: string;

  @Column({ nullable: true })
  costCenterId: string;

  @Column({ nullable: true })
  functionalAreaId: string;

  @Column({ nullable: true })
  locationId: string;

  @Column({ length: 100, nullable: true })
  workLocation: string;

  @Column({ length: 100, nullable: true })
  officeLocation: string;

  // Reporting Structure
  @Column({ nullable: true })
  reportsToPositionId: string;

  @Column({ nullable: true })
  reportsToEmployeeId: string;

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

  // Headcount & Control
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1 })
  headcountAllocation: number; // FTE allocation

  @Column({ type: 'int', default: 1 })
  numberOfPositions: number; // Multiple identical positions

  @Column({ type: 'int', default: 0 })
  filledPositions: number;

  @Column({ type: 'int', default: 0 })
  vacantPositions: number;

  @Column({ length: 50, nullable: true })
  positionControl: string; // Approved, Frozen, Budget Hold, Under Review

  @Column({ type: 'date', nullable: true })
  positionControlDate: Date;

  @Column({ type: 'text', nullable: true })
  positionControlReason: string;

  // Grade & Compensation
  @Column({ nullable: true })
  gradeId: string;

  @Column({ nullable: true })
  bandId: string;

  @Column({ nullable: true })
  levelId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  minSalary: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  midSalary: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  maxSalary: number;

  @Column({ length: 10, nullable: true })
  salaryCurrency: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  targetBonusPercentage: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalCompensationTarget: number;

  // Budget Information
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  budgetedSalary: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  actualSalary: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalBudgetedCost: number; // Including benefits, overhead

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalActualCost: number;

  @Column({ type: 'int', nullable: true })
  budgetYear: number;

  @Column({ length: 100, nullable: true })
  budgetStatus: string; // Approved, Pending, Over Budget, Under Budget

  @Column({ type: 'date', nullable: true })
  budgetApprovalDate: Date;

  // Employment Terms
  @Column({ length: 50, nullable: true })
  employmentType: string; // Full-Time, Part-Time, Contract, Temporary, Intern, Consultant

  @Column({ length: 50, nullable: true })
  workArrangement: string; // On-Site, Remote, Hybrid, Field-Based

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  ftePercentage: number;

  @Column({ default: 40 })
  hoursPerWeek: number;

  @Column({ default: false })
  isExempt: boolean; // Exempt from overtime

  @Column({ length: 50, nullable: true })
  shiftPattern: string;

  @Column({ default: false })
  requiresShiftWork: boolean;

  // Job Requirements
  @Column({ type: 'text', nullable: true })
  jobSummary: string;

  @Column({ type: 'text', nullable: true })
  keyResponsibilities: string;

  @Column({ type: 'jsonb', nullable: true })
  responsibilities: any[];

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

  @Column({ type: 'simple-array', nullable: true })
  licenses: string[];

  // Position Characteristics
  @Column({ default: false })
  isCustomerFacing: boolean;

  @Column({ default: false })
  isRevenueDriving: boolean;

  @Column({ default: false })
  isCostCenter: boolean;

  @Column({ default: false })
  requiresTravel: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  travelPercentage: number;

  @Column({ default: false })
  requiresSecurityClearance: boolean;

  @Column({ type: 'simple-array', nullable: true })
  securityClearances: string[];

  // Dates & Timeline
  @Column({ type: 'date', nullable: true })
  creationDate: Date;

  @Column({ type: 'date', nullable: true })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ type: 'date', nullable: true })
  lastFilledDate: Date;

  @Column({ type: 'date', nullable: true })
  lastVacatedDate: Date;

  @Column({ type: 'date', nullable: true })
  anticipatedFillDate: Date;

  @Column({ default: 0 })
  daysVacant: number;

  // Incumbent Information
  @Column({ nullable: true })
  incumbentEmployeeId: string;

  @Column({ nullable: true })
  incumbentName: string;

  @Column({ type: 'date', nullable: true })
  incumbentStartDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  incumbentHistory: any[]; // Previous incumbents

  // Succession Planning
  @Column({ type: 'simple-array', nullable: true })
  successorCandidates: string[]; // Employee IDs

  @Column({ type: 'jsonb', nullable: true })
  successionPlan: any;

  @Column({ type: 'int', nullable: true })
  successionReadiness: number; // 0-100

  @Column({ type: 'simple-array', nullable: true })
  keySuccessors: string[];

  @Column({ type: 'simple-array', nullable: true })
  emergencySuccessors: string[];

  // Recruitment Information
  @Column({ nullable: true })
  requisitionId: string;

  @Column({ type: 'date', nullable: true })
  requisitionDate: Date;

  @Column({ length: 50, nullable: true })
  requisitionStatus: string;

  @Column({ type: 'date', nullable: true })
  targetStartDate: Date;

  @Column({ type: 'int', nullable: true })
  targetTimeToFill: number; // Days

  @Column({ type: 'int', nullable: true })
  actualTimeToFill: number; // Days

  @Column({ default: 0 })
  numberOfOpenings: number;

  // Job Description
  @Column({ nullable: true })
  jobDescriptionId: string;

  @Column({ type: 'date', nullable: true })
  jobDescriptionDate: Date;

  @Column({ length: 100, nullable: true })
  jobDescriptionVersion: string;

  @Column({ type: 'date', nullable: true })
  lastReviewedDate: Date;

  @Column({ type: 'date', nullable: true })
  nextReviewDate: Date;

  // Compliance & Legal
  @Column({ type: 'simple-array', nullable: true })
  complianceRequirements: string[];

  @Column({ type: 'simple-array', nullable: true })
  regulatoryRequirements: string[];

  @Column({ length: 50, nullable: true })
  backgroundCheckLevel: string;

  @Column({ default: false })
  requiresLicensing: boolean;

  @Column({ nullable: true })
  sponsoringCompanyId: string;

  @Column({ length: 100, nullable: true })
  legalEntity: string;

  // Approval Workflow
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
  approvalWorkflow: any;

  // Performance & Analytics
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  averagePerformanceRating: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  turnoverRate: number;

  @Column({ type: 'int', nullable: true })
  averageTenureMonths: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  retentionRate: number;

  @Column({ type: 'int', nullable: true })
  historicalFillTime: number; // Average days to fill

  @Column({ type: 'int', nullable: true })
  numberOfIncumbents: number; // Historical count

  // Risk & Impact
  @Column({ length: 50, nullable: true })
  businessImpact: string; // Critical, High, Medium, Low

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  vacancyRiskScore: number; // 0-100

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  successionRiskScore: number; // 0-100

  @Column({ default: false })
  isAtRisk: boolean;

  @Column({ type: 'text', nullable: true })
  riskMitigation: string;

  // Market Intelligence
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  marketMedianSalary: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  competitiveIndex: number; // How competitive is salary

  @Column({ length: 50, nullable: true })
  marketDemand: string; // High, Medium, Low, Very High

  @Column({ length: 50, nullable: true })
  talentAvailability: string;

  @Column({ type: 'date', nullable: true })
  lastMarketReview: Date;

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
