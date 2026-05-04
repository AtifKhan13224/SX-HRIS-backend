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
import { Position } from '../../organization-settings/entities/position.entity';
import { Department } from '../../organization-settings/entities/department.entity';
import { RecruitmentSource } from './recruitment-source.entity';

@Entity('job_openings')
export class JobOpening {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'group_company_id', nullable: true })
  groupCompanyId: string;

  @ManyToOne(() => GroupCompany)
  @JoinColumn({ name: 'group_company_id' })
  groupCompany: GroupCompany;

  @Column({ name: 'position_id', nullable: true })
  positionId: string;

  @ManyToOne(() => Position)
  @JoinColumn({ name: 'position_id' })
  position: Position;

  @Column({ name: 'department_id', nullable: true })
  departmentId: string;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  // Basic Information
  @Column({ unique: true, length: 50 })
  jobCode: string;

  @Column({ length: 200 })
  jobTitle: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  requirements: string;

  @Column({ type: 'text', nullable: true })
  responsibilities: string;

  @Column({ type: 'text', nullable: true })
  qualifications: string;

  @Column({ type: 'text', nullable: true })
  skillsRequired: string;

  @Column({ type: 'text', nullable: true })
  benefitsOffered: string;

  // Job Details
  @Column({ length: 50 })
  employmentType: string; // Full-Time, Part-Time, Contract, Internship, Temporary

  @Column({ length: 50 })
  workMode: string; // On-Site, Remote, Hybrid

  @Column({ length: 100, nullable: true })
  location: string;

  @Column({ name: 'city_id', nullable: true })
  cityId: string;

  @Column({ name: 'state_id', nullable: true })
  stateId: string;

  @Column({ name: 'country_id', nullable: true })
  countryId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  minSalary: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  maxSalary: number;

  @Column({ length: 20, nullable: true })
  salaryCurrency: string;

  @Column({ length: 50, nullable: true })
  salaryPeriod: string; // Monthly, Annual

  @Column({ default: false })
  hideSalary: boolean;

  @Column()
  numberOfPositions: number;

  @Column()
  numberOfPositionsFilled: number;

  @Column()
  numberOfPositionsRemaining: number;

  // Experience & Education
  @Column({ nullable: true })
  minExperience: number; // in years

  @Column({ nullable: true })
  maxExperience: number; // in years

  @Column({ length: 50, nullable: true })
  educationLevel: string; // High School, Bachelor's, Master's, PhD, etc.

  @Column({ type: 'text', nullable: true })
  preferredDegrees: string;

  @Column({ type: 'text', nullable: true })
  certifications: string;

  // Dates
  @Column({ type: 'date' })
  postingDate: Date;

  @Column({ type: 'date', nullable: true })
  closingDate: Date;

  @Column({ type: 'date', nullable: true })
  targetHireDate: Date;

  @Column({ default: false })
  isUrgent: boolean;

  @Column({ length: 50, nullable: true })
  priority: string; // High, Medium, Low

  // Status & Visibility
  @Column({ length: 50 })
  status: string; // Draft, Open, On Hold, Closed, Cancelled, Archived

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  isPublished: boolean;

  @Column({ default: true })
  acceptApplications: boolean;

  @Column({ default: false })
  isInternal: boolean; // Internal posting only

  @Column({ default: false })
  isConfidential: boolean;

  // Publishing & Distribution
  @Column({ type: 'simple-array', nullable: true })
  publishedOn: string[]; // Array of source IDs where job is posted

  @Column({ type: 'jsonb', nullable: true })
  externalLinks: any; // Links to job postings on external platforms

  // Recruitment Team
  @Column({ name: 'hiring_manager_id', nullable: true })
  hiringManagerId: string;

  @Column({ name: 'recruiter_id', nullable: true })
  recruiterId: string;

  @Column({ type: 'simple-array', nullable: true })
  interviewPanelIds: string[];

  @Column({ type: 'simple-array', nullable: true })
  approverIds: string[];

  // Workflow
  @Column({ name: 'workflow_id', nullable: true })
  workflowId: string;

  @Column({ length: 50, nullable: true })
  approvalStatus: string; // Pending, Approved, Rejected

  @Column({ type: 'date', nullable: true })
  approvedDate: Date;

  @Column({ nullable: true })
  approvedBy: string;

  // Statistics
  @Column({ default: 0 })
  totalApplications: number;

  @Column({ default: 0 })
  newApplications: number;

  @Column({ default: 0 })
  applicationsInReview: number;

  @Column({ default: 0 })
  applicationsShortlisted: number;

  @Column({ default: 0 })
  applicationsRejected: number;

  @Column({ default: 0 })
  interviewsScheduled: number;

  @Column({ default: 0 })
  offersExtended: number;

  @Column({ default: 0 })
  offersAccepted: number;

  @Column({ default: 0 })
  viewCount: number;

  // Screening Questions
  @Column({ type: 'jsonb', nullable: true })
  screeningQuestions: any;

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
