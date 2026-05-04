import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Interview Entity
 * Interview scheduling and management with panel support
 * Enterprise-grade interview tracking
 */
@Entity('interviews')
@Index(['companyId'])
@Index(['applicationId'])
@Index(['scheduledAt'])
@Index(['status'])
export class Interview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'company_id' })
  @Index()
  companyId: string;

  @Column({ type: 'uuid', name: 'application_id' })
  @Index()
  applicationId: string;

  @Column({ type: 'uuid', name: 'candidate_id' })
  candidateId: string;

  @Column({ type: 'uuid', name: 'requisition_id' })
  requisitionId: string;

  @Column({ type: 'varchar', length: 100, name: 'interview_number', unique: true })
  @Index()
  interviewNumber: string;

  // Interview Details
  @Column({ type: 'varchar', length: 200, nullable: true })
  title: string;

  @Column({ type: 'varchar', length: 50, name: 'interview_type' })
  interviewType: string; // phone_screen, video, in_person, panel, technical, behavioral, case_study, presentation

  @Column({ type: 'int', name: 'interview_round', default: 1 })
  interviewRound: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Scheduling
  @Column({ type: 'timestamp', name: 'scheduled_at' })
  @Index()
  scheduledAt: Date;

  @Column({ type: 'timestamp', name: 'scheduled_end_at' })
  scheduledEndAt: Date;

  @Column({ type: 'int', default: 60 })
  duration: number; // minutes

  @Column({ type: 'varchar', length: 100, nullable: true })
  timezone: string;

  // Location/Platform
  @Column({ type: 'varchar', length: 50, default: 'virtual' })
  location: string; // virtual, in_person, phone

  @Column({ type: 'text', name: 'location_details', nullable: true })
  locationDetails: string;

  @Column({ type: 'varchar', length: 100, name: 'meeting_platform', nullable: true })
  meetingPlatform: string; // Zoom, Teams, Google Meet, etc.

  @Column({ type: 'varchar', length: 500, name: 'meeting_link', nullable: true })
  meetingLink: string;

  @Column({ type: 'varchar', length: 200, name: 'meeting_id', nullable: true })
  meetingId: string;

  @Column({ type: 'varchar', length: 200, name: 'meeting_passcode', nullable: true })
  meetingPasscode: string;

  @Column({ type: 'varchar', length: 200, name: 'dial_in_number', nullable: true })
  dialInNumber: string;

  @Column({ type: 'text', name: 'conference_room', nullable: true })
  conferenceRoom: string;

  @Column({ type: 'text', name: 'address', nullable: true })
  address: string;

  // Interviewers
  @Column({ type: 'jsonb', default: [] })
  interviewers: Array<{
    userId: string;
    userName: string;
    email: string;
    role: string;
    isPrimary: boolean;
    hasResponded: boolean;
    response?: 'accepted' | 'declined' | 'tentative';
    responseDate?: Date;
    hasSubmittedFeedback: boolean;
  }>;

  @Column({ type: 'boolean', name: 'is_panel_interview', default: false })
  isPanelInterview: boolean;

  @Column({ type: 'uuid', name: 'primary_interviewer_id', nullable: true })
  primaryInterviewerId: string;

  // Status
  @Column({ type: 'varchar', length: 50, default: 'scheduled' })
  @Index()
  status: string; // scheduled, confirmed, in_progress, completed, cancelled, no_show, rescheduled

  @Column({ type: 'timestamp', name: 'confirmed_at', nullable: true })
  confirmedAt: Date;

  @Column({ type: 'boolean', name: 'candidate_confirmed', default: false })
  candidateConfirmed: boolean;

  @Column({ type: 'timestamp', name: 'candidate_confirmed_at', nullable: true })
  candidateConfirmedAt: Date;

  // Rescheduling
  @Column({ type: 'int', name: 'reschedule_count', default: 0 })
  rescheduleCount: number;

  @Column({ type: 'uuid', name: 'previous_interview_id', nullable: true })
  previousInterviewId: string;

  @Column({ type: 'text', name: 'reschedule_reason', nullable: true })
  rescheduleReason: string;

  @Column({ type: 'varchar', length: 50, name: 'rescheduled_by', nullable: true })
  rescheduledBy: string; // candidate, interviewer, recruiter

  // Cancellation
  @Column({ type: 'text', name: 'cancellation_reason', nullable: true })
  cancellationReason: string;

  @Column({ type: 'varchar', length: 50, name: 'cancelled_by', nullable: true })
  cancelledBy: string;

  @Column({ type: 'timestamp', name: 'cancelled_at', nullable: true })
  cancelledAt: Date;

  // Evaluation Criteria
  @Column({ type: 'jsonb', name: 'evaluation_criteria', default: [] })
  evaluationCriteria: Array<{
    id: string;
    category: string;
    criterion: string;
    weight: number;
    maxScore: number;
  }>;

  // Interview Guide
  @Column({ type: 'jsonb', name: 'interview_guide', default: {} })
  interviewGuide: {
    questions: Array<{
      id: string;
      question: string;
      type: string;
      expectedAnswer?: string;
      scoringGuidance?: string;
    }>;
    topics: string[];
    duration: number;
    notes?: string;
  };

  // Preparation Materials
  @Column({ type: 'jsonb', name: 'preparation_materials', default: [] })
  preparationMaterials: Array<{
    type: string;
    name: string;
    url: string;
    visibleToCandidate: boolean;
  }>;

  // Recording
  @Column({ type: 'boolean', name: 'is_recorded', default: false })
  isRecorded: boolean;

  @Column({ type: 'varchar', length: 500, name: 'recording_url', nullable: true })
  recordingUrl: string;

  @Column({ type: 'boolean', name: 'recording_consent_obtained', default: false })
  recordingConsentObtained: boolean;

  // Completion
  @Column({ type: 'timestamp', name: 'started_at', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', name: 'completed_at', nullable: true })
  completedAt: Date;

  @Column({ type: 'int', name: 'actual_duration', nullable: true })
  actualDuration: number;

  // Feedback Summary
  @Column({ type: 'int', name: 'evaluations_submitted', default: 0 })
  evaluationsSubmitted: number;

  @Column({ type: 'int', name: 'evaluations_required', default: 0 })
  evaluationsRequired: number;

  @Column({ type: 'boolean', name: 'all_feedback_received', default: false })
  allFeedbackReceived: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'average_score', nullable: true })
  averageScore: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  recommendation: string; // strong_hire, hire, maybe, no_hire, strong_no_hire

  // Notifications
  @Column({ type: 'boolean', name: 'candidate_invited', default: false })
  candidateInvited: boolean;

  @Column({ type: 'timestamp', name: 'candidate_invited_at', nullable: true })
  candidateInvitedAt: Date;

  @Column({ type: 'boolean', name: 'interviewers_invited', default: false })
  interviewersInvited: boolean;

  @Column({ type: 'timestamp', name: 'interviewers_invited_at', nullable: true })
  interviewersInvitedAt: Date;

  @Column({ type: 'boolean', name: 'reminder_sent', default: false })
  reminderSent: boolean;

  @Column({ type: 'timestamp', name: 'reminder_sent_at', nullable: true })
  reminderSentAt: Date;

  // Calendar Integration
  @Column({ type: 'varchar', length: 200, name: 'calendar_event_id', nullable: true })
  calendarEventId: string;

  @Column({ type: 'boolean', name: 'calendar_synced', default: false })
  calendarSynced: boolean;

  // Notes
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', name: 'internal_notes', nullable: true })
  internalNotes: string;

  // Tags
  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  // Audit
  @Column({ type: 'uuid', name: 'created_by' })
  createdBy: string;

  @Column({ type: 'uuid', name: 'updated_by', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
