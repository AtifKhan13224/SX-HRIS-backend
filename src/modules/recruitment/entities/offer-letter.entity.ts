import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Application } from './application.entity';
import { Candidate } from './candidate.entity';
import { JobOpening } from './job-opening.entity';

@Entity('offer_letters')
export class OfferLetter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'application_id' })
  applicationId: string;

  @ManyToOne(() => Application)
  @JoinColumn({ name: 'application_id' })
  application: Application;

  @Column({ name: 'candidate_id' })
  candidateId: string;

  @ManyToOne(() => Candidate)
  @JoinColumn({ name: 'candidate_id' })
  candidate: Candidate;

  @Column({ name: 'job_opening_id' })
  jobOpeningId: string;

  @ManyToOne(() => JobOpening)
  @JoinColumn({ name: 'job_opening_id' })
  jobOpening: JobOpening;

  // Offer Details
  @Column({ unique: true, length: 50 })
  offerNumber: string;

  @Column({ length: 200 })
  positionTitle: string;

  @Column({ length: 50 })
  employmentType: string; // Full-Time, Part-Time, Contract, Temporary

  @Column({ type: 'date' })
  offerDate: Date;

  @Column({ type: 'date' })
  expiryDate: Date;

  @Column({ length: 50 })
  status: string; // Draft, Sent, Viewed, Accepted, Rejected, Negotiating, Withdrawn, Expired

  // Compensation
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  basicSalary: number;

  @Column({ length: 20 })
  salaryCurrency: string;

  @Column({ length: 50 })
  salaryPeriod: string; // Monthly, Annual

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  housingAllowance: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  transportAllowance: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  otherAllowances: number;

  @Column({ type: 'jsonb', nullable: true })
  allowanceBreakdown: any;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalMonthlyCompensation: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAnnualCompensation: number;

  // Bonus & Benefits
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  signingBonus: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  annualBonus: number;

  @Column({ length: 200, nullable: true })
  bonusStructure: string; // e.g., "Up to 20% of annual salary"

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  relocationAllowance: number;

  @Column({ type: 'text', nullable: true })
  benefits: string;

  @Column({ type: 'jsonb', nullable: true })
  benefitsPackage: any; // Structured benefits data

  // Leave Entitlements
  @Column({ nullable: true })
  annualLeave: number; // days per year

  @Column({ nullable: true })
  sickLeave: number;

  @Column({ nullable: true })
  casualLeave: number;

  @Column({ type: 'text', nullable: true })
  otherLeaves: string;

  // Work Details
  @Column({ length: 100, nullable: true })
  workLocation: string;

  @Column({ length: 50, nullable: true })
  workMode: string; // On-Site, Remote, Hybrid

  @Column({ length: 100, nullable: true })
  department: string;

  @Column({ length: 100, nullable: true })
  reportingTo: string;

  @Column({ length: 100, nullable: true })
  reportingToTitle: string;

  @Column({ nullable: true })
  reportingToId: string;

  // Employment Terms
  @Column({ type: 'date' })
  proposedJoiningDate: Date;

  @Column({ nullable: true })
  probationPeriod: number; // in months

  @Column({ nullable: true })
  noticePeriod: number; // in days

  @Column({ nullable: true })
  contractDuration: number; // in months, for contract roles

  @Column({ length: 200, nullable: true })
  workingHours: string; // e.g., "9 AM to 6 PM"

  @Column({ nullable: true })
  hoursPerWeek: number;

  // Documents & Templates
  @Column({ nullable: true })
  templateId: string;

  @Column({ length: 500, nullable: true })
  offerLetterPath: string; // Generated offer letter PDF

  @Column({ type: 'text', nullable: true })
  offerLetterContent: string; // HTML or text content

  @Column({ type: 'simple-array', nullable: true })
  attachmentPaths: string[];

  // Special Conditions
  @Column({ type: 'text', nullable: true })
  specialConditions: string;

  @Column({ type: 'text', nullable: true })
  termsAndConditions: string;

  @Column({ type: 'text', nullable: true })
  confidentialityClauses: string;

  @Column({ type: 'text', nullable: true })
  nonCompeteClauses: string;

  // Approval
  @Column({ length: 50, nullable: true })
  approvalStatus: string; // Pending, Approved, Rejected

  @Column({ type: 'simple-array', nullable: true })
  approverIds: string[];

  @Column({ type: 'jsonb', nullable: true })
  approvalHistory: any;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'date', nullable: true })
  approvedDate: Date;

  @Column({ type: 'text', nullable: true })
  approvalComments: string;

  // Communication
  @Column({ default: false })
  isSent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  sentDate: Date;

  @Column({ nullable: true })
  sentBy: string;

  @Column({ default: false })
  isViewed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  viewedDate: Date;

  @Column({ default: 0 })
  viewCount: number;

  // Candidate Response
  @Column({ default: false })
  isAccepted: boolean;

  @Column({ type: 'date', nullable: true })
  acceptedDate: Date;

  @Column({ default: false })
  isRejected: boolean;

  @Column({ type: 'date', nullable: true })
  rejectedDate: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ default: false })
  isNegotiating: boolean;

  @Column({ type: 'text', nullable: true })
  negotiationNotes: string;

  @Column({ type: 'jsonb', nullable: true })
  negotiationHistory: any;

  // Signature
  @Column({ default: false })
  isSignedByCandidate: boolean;

  @Column({ type: 'timestamp', nullable: true })
  candidateSignatureDate: Date;

  @Column({ length: 500, nullable: true })
  candidateSignaturePath: string;

  @Column({ default: false })
  isSignedByCompany: boolean;

  @Column({ type: 'timestamp', nullable: true })
  companySignatureDate: Date;

  @Column({ nullable: true })
  companySignedBy: string;

  @Column({ length: 500, nullable: true })
  companySignaturePath: string;

  // Joining
  @Column({ type: 'date', nullable: true })
  actualJoiningDate: Date;

  @Column({ default: false })
  candidateJoined: boolean;

  @Column({ nullable: true })
  employeeId: string; // Once joined

  // Withdrawal/Cancellation
  @Column({ default: false })
  isWithdrawn: boolean;

  @Column({ type: 'date', nullable: true })
  withdrawnDate: Date;

  @Column({ nullable: true })
  withdrawnBy: string;

  @Column({ type: 'text', nullable: true })
  withdrawalReason: string;

  // Tracking
  @Column({ nullable: true })
  daysToAcceptance: number;

  @Column({ nullable: true })
  daysToJoining: number;

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
