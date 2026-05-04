import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GroupCompany } from '../../organization-settings/entities/group-company.entity';
import { Department } from '../../organization-settings/entities/department.entity';
import { Position } from '../../organization-settings/entities/position.entity';

@Entity('requisitions')
export class Requisition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'group_company_id', nullable: true })
  groupCompanyId: string;

  @ManyToOne(() => GroupCompany)
  @JoinColumn({ name: 'group_company_id' })
  groupCompany: GroupCompany;

  @Column({ name: 'department_id', nullable: true })
  departmentId: string;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column({ name: 'position_id', nullable: true })
  positionId: string;

  @ManyToOne(() => Position)
  @JoinColumn({ name: 'position_id' })
  position: Position;

  // Requisition Details
  @Column({ unique: true, length: 50 })
  requisitionNumber: string;

  @Column({ length: 200 })
  positionTitle: string;

  @Column({ length: 50 })
  requisitionType: string; // New Position, Replacement, Additional Headcount, Backfill

  @Column({ type: 'text', nullable: true })
  businessJustification: string;

  @Column()
  numberOfPositions: number;

  @Column({ default: 0 })
  positionsFilled: number;

  @Column({ length: 50 })
  employmentType: string; // Full-Time, Part-Time, Contract, Temporary, Intern

  @Column({ length: 50, nullable: true })
  workMode: string; // On-Site, Remote, Hybrid

  @Column({ length: 100, nullable: true })
  location: string;

  // Replacement Details (if applicable)
  @Column({ nullable: true })
  replacingEmployeeId: string;

  @Column({ length: 200, nullable: true })
  replacingEmployeeName: string;

  @Column({ type: 'date', nullable: true })
  vacancyDate: Date;

  @Column({ type: 'text', nullable: true })
  reasonForVacancy: string;

  // Budget Information
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  minSalary: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  maxSalary: number;

  @Column({ length: 20, nullable: true })
  salaryCurrency: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  annualBudget: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalBudgetImpact: number;

  @Column({ default: false })
  isBudgeted: boolean;

  @Column({ length: 100, nullable: true })
  budgetCode: string;

  @Column({ nullable: true })
  costCenterId: string;

  // Requirements
  @Column({ type: 'text', nullable: true })
  keyResponsibilities: string;

  @Column({ type: 'text', nullable: true })
  requiredQualifications: string;

  @Column({ type: 'text', nullable: true })
  requiredSkills: string;

  @Column({ nullable: true })
  minExperience: number;

  @Column({ nullable: true })
  maxExperience: number;

  @Column({ length: 100, nullable: true })
  educationLevel: string;

  // Timeline
  @Column({ type: 'date' })
  requestDate: Date;

  @Column({ type: 'date', nullable: true })
  targetHireDate: Date;

  @Column({ type: 'date', nullable: true })
  closingDate: Date;

  @Column({ default: false })
  isUrgent: boolean;

  @Column({ length: 50, nullable: true })
  priority: string; // High, Medium, Low

  // Requesting Manager
  @Column()
  requestedBy: string; // Employee ID

  @Column({ length: 200 })
  requestedByName: string;

  @Column({ length: 200, nullable: true })
  requestedByTitle: string;

  @Column({ nullable: true })
  hiringManagerId: string;

  @Column({ length: 200, nullable: true })
  hiringManagerName: string;

  // Approval Workflow
  @Column({ length: 50 })
  status: string; // Draft, Pending Approval, Approved, Rejected, On Hold, Cancelled, Closed

  @Column({ length: 50, nullable: true })
  approvalStatus: string; // Pending, Approved, Rejected, Partially Approved

  @Column({ type: 'jsonb', nullable: true })
  approvalWorkflow: any; // Multi-level approval chain

  @Column({ type: 'simple-array', nullable: true })
  approverIds: string[];

  @Column({ type: 'jsonb', nullable: true })
  approvalHistory: any; // History of approvals/rejections

  @Column({ nullable: true })
  currentApproverId: string;

  @Column({ type: 'date', nullable: true })
  approvalCompletedDate: Date;

  @Column({ nullable: true })
  finalApprovedBy: string;

  @Column({ type: 'text', nullable: true })
  approvalComments: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  // Job Opening Link
  @Column({ nullable: true })
  jobOpeningId: string; // Link to created job opening

  @Column({ default: false })
  jobOpeningCreated: boolean;

  @Column({ type: 'date', nullable: true })
  jobOpeningCreatedDate: Date;

  // Additional Information
  @Column({ type: 'text', nullable: true })
  additionalRequirements: string;

  @Column({ type: 'text', nullable: true })
  internalNotes: string;

  @Column({ type: 'simple-array', nullable: true })
  attachmentPaths: string[];

  // Tracking
  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isClosed: boolean;

  @Column({ type: 'date', nullable: true })
  closedDate: Date;

  @Column({ nullable: true })
  closedBy: string;

  @Column({ type: 'text', nullable: true })
  closureReason: string;

  // Metrics
  @Column({ nullable: true })
  daysToApproval: number;

  @Column({ nullable: true })
  daysToFill: number;

  // Custom Fields
  @Column({ type: 'jsonb', nullable: true })
  customFields: any;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string;
}
