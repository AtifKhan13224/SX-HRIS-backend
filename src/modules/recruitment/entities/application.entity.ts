import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Candidate } from './candidate.entity';
import { JobOpening } from './job-opening.entity';
import { RecruitmentStage } from './recruitment-stage.entity';

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({ name: 'current_stage_id', nullable: true })
  currentStageId: string;

  @ManyToOne(() => RecruitmentStage)
  @JoinColumn({ name: 'current_stage_id' })
  currentStage: RecruitmentStage;

  // Application Details
  @Column({ unique: true, length: 50 })
  applicationNumber: string;

  @Column({ type: 'date' })
  applicationDate: Date;

  @Column({ length: 50 })
  status: string; // Applied, Screening, Interview, Shortlisted, Offered, Hired, Rejected, Withdrawn

  @Column({ length: 50, nullable: true })
  subStatus: string; // More detailed status

  @Column({ default: true })
  isActive: boolean;

  // Cover Letter & Documents
  @Column({ type: 'text', nullable: true })
  coverLetter: string;

  @Column({ length: 500, nullable: true })
  resumePath: string;

  @Column({ type: 'simple-array', nullable: true })
  attachmentPaths: string[];

  // Screening
  @Column({ type: 'jsonb', nullable: true })
  screeningAnswers: any; // Answers to screening questions

  @Column({ default: false })
  screeningPassed: boolean;

  @Column({ type: 'text', nullable: true })
  screeningNotes: string;

  @Column({ nullable: true })
  screeningScore: number;

  // Assessment
  @Column({ type: 'simple-array', nullable: true })
  assessmentIds: string[];

  @Column({ type: 'jsonb', nullable: true })
  assessmentResults: any;

  @Column({ nullable: true })
  assessmentScore: number;

  // Interview
  @Column({ default: 0 })
  totalInterviews: number;

  @Column({ default: 0 })
  completedInterviews: number;

  @Column({ type: 'date', nullable: true })
  lastInterviewDate: Date;

  @Column({ type: 'date', nullable: true })
  nextInterviewDate: Date;

  // Evaluation
  @Column({ nullable: true })
  overallRating: number; // 1-5 scale

  @Column({ type: 'jsonb', nullable: true })
  evaluationScores: any; // Scores from different evaluators

  @Column({ type: 'text', nullable: true })
  evaluationNotes: string;

  @Column({ type: 'text', nullable: true })
  strengths: string;

  @Column({ type: 'text', nullable: true })
  weaknesses: string;

  // Decision
  @Column({ length: 50, nullable: true })
  hiringDecision: string; // Selected, Rejected, On Hold, Waitlisted

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'date', nullable: true })
  decisionDate: Date;

  @Column({ nullable: true })
  decisionBy: string;

  // Offer
  @Column({ nullable: true })
  offerId: string;

  @Column({ default: false })
  offerExtended: boolean;

  @Column({ type: 'date', nullable: true })
  offerDate: Date;

  @Column({ type: 'date', nullable: true })
  offerExpiryDate: Date;

  @Column({ length: 50, nullable: true })
  offerStatus: string; // Pending, Accepted, Rejected, Negotiating

  // Hiring
  @Column({ default: false })
  isHired: boolean;

  @Column({ type: 'date', nullable: true })
  joiningDate: Date;

  @Column({ type: 'date', nullable: true })
  actualJoiningDate: Date;

  @Column({ nullable: true })
  employeeId: string; // Once hired

  // Assignment
  @Column({ nullable: true })
  assignedTo: string; // Recruiter/Hiring Manager assigned

  @Column({ type: 'date', nullable: true })
  assignedDate: Date;

  // Communication
  @Column({ type: 'date', nullable: true })
  lastContactDate: Date;

  @Column({ type: 'text', nullable: true })
  lastContactNotes: string;

  @Column({ default: 0 })
  emailsSent: number;

  @Column({ default: 0 })
  callsMade: number;

  // Timeline
  @Column({ type: 'jsonb', nullable: true })
  stageHistory: any; // History of stage transitions

  @Column({ type: 'jsonb', nullable: true })
  activityLog: any; // Log of all activities

  // Flags
  @Column({ default: false })
  isFlagged: boolean;

  @Column({ type: 'text', nullable: true })
  flagReason: string;

  @Column({ default: false })
  isStarred: boolean;

  @Column({ default: false })
  isFavorite: boolean;

  // Metrics
  @Column({ nullable: true })
  daysInPipeline: number;

  @Column({ nullable: true })
  daysInCurrentStage: number;

  @Column({ nullable: true })
  responseTime: number; // Time taken to respond in hours

  // Source Tracking
  @Column({ length: 100, nullable: true })
  utmSource: string;

  @Column({ length: 100, nullable: true })
  utmMedium: string;

  @Column({ length: 100, nullable: true })
  utmCampaign: string;

  @Column({ length: 500, nullable: true })
  referralUrl: string;

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
