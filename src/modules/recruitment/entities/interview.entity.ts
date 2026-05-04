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

@Entity('interviews')
export class Interview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'application_id' })
  applicationId: string;

  @ManyToOne(() => Application)
  @JoinColumn({ name: 'application_id' })
  application: Application;

  // Interview Details
  @Column({ length: 200 })
  title: string;

  @Column({ length: 50 })
  type: string; // Phone, Video, In-Person, Technical, HR, Managerial, Panel

  @Column({ length: 50 })
  round: string; // Round 1, Round 2, Final, etc.

  @Column({ nullable: true })
  roundNumber: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Scheduling
  @Column({ type: 'timestamp' })
  scheduledDate: Date;

  @Column({ nullable: true })
  duration: number; // in minutes

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ length: 50 })
  status: string; // Scheduled, Confirmed, Rescheduled, Completed, Cancelled, No Show

  // Location/Link
  @Column({ length: 50, nullable: true })
  mode: string; // Virtual, On-Site

  @Column({ length: 500, nullable: true })
  location: string; // Physical address

  @Column({ length: 500, nullable: true })
  meetingLink: string; // Video conference link

  @Column({ length: 200, nullable: true })
  meetingId: string;

  @Column({ length: 200, nullable: true })
  meetingPassword: string;

  // Interviewers
  @Column({ type: 'simple-array' })
  interviewerIds: string[];

  @Column({ nullable: true })
  primaryInterviewerId: string;

  @Column({ type: 'jsonb', nullable: true })
  interviewerDetails: any;

  // Preparation
  @Column({ type: 'text', nullable: true })
  agenda: string;

  @Column({ type: 'text', nullable: true })
  preparationNotes: string;

  @Column({ type: 'jsonb', nullable: true })
  questionBank: any; // Pre-defined questions

  @Column({ type: 'simple-array', nullable: true })
  skillsToAssess: string[];

  @Column({ type: 'simple-array', nullable: true })
  requiredDocuments: string[];

  // Feedback & Evaluation
  @Column({ type: 'jsonb', nullable: true })
  feedback: any; // Structured feedback from interviewers

  @Column({ nullable: true })
  overallRating: number; // 1-5 scale

  @Column({ type: 'jsonb', nullable: true })
  skillRatings: any; // Rating per skill

  @Column({ type: 'text', nullable: true })
  interviewNotes: string;

  @Column({ type: 'text', nullable: true })
  strengths: string;

  @Column({ type: 'text', nullable: true })
  concerns: string;

  @Column({ length: 50, nullable: true })
  recommendation: string; // Strongly Recommend, Recommend, Neutral, Not Recommend, Reject

  @Column({ default: false })
  feedbackSubmitted: boolean;

  @Column({ type: 'date', nullable: true })
  feedbackSubmittedDate: Date;

  // Technical Assessment (if applicable)
  @Column({ default: false })
  hasCodingTest: boolean;

  @Column({ length: 500, nullable: true })
  codingTestLink: string;

  @Column({ nullable: true })
  codingTestScore: number;

  @Column({ type: 'text', nullable: true })
  technicalAssessmentNotes: string;

  // Communication
  @Column({ default: false })
  candidateNotified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  candidateNotifiedDate: Date;

  @Column({ default: false })
  reminderSent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  reminderSentDate: Date;

  @Column({ default: false })
  interviewersNotified: boolean;

  // Rescheduling
  @Column({ default: 0 })
  rescheduleCount: number;

  @Column({ type: 'text', nullable: true })
  rescheduleReason: string;

  @Column({ type: 'timestamp', nullable: true })
  originalScheduledDate: Date;

  // Cancellation
  @Column({ default: false })
  isCancelled: boolean;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  @Column({ nullable: true })
  cancelledBy: string;

  @Column({ type: 'timestamp', nullable: true })
  cancelledDate: Date;

  // Attendance
  @Column({ default: false })
  candidateAttended: boolean;

  @Column({ type: 'timestamp', nullable: true })
  actualStartTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualEndTime: Date;

  @Column({ nullable: true })
  actualDuration: number; // in minutes

  // Follow-up
  @Column({ default: false })
  requiresFollowUp: boolean;

  @Column({ type: 'text', nullable: true })
  followUpNotes: string;

  @Column({ type: 'timestamp', nullable: true })
  followUpDate: Date;

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
