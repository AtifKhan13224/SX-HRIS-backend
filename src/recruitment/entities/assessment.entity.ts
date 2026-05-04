import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Assessment Entity
 * Skills, cognitive, and personality assessments
 * Enterprise-grade assessment management
 */
@Entity('assessments')
@Index(['companyId'])
@Index(['applicationId'])
@Index(['candidateId'])
@Index(['status'])
export class Assessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'company_id' })
  @Index()
  companyId: string;

  @Column({ type: 'uuid', name: 'application_id' })
  @Index()
  applicationId: string;

  @Column({ type: 'uuid', name: 'candidate_id' })
  @Index()
  candidateId: string;

  @Column({ type: 'uuid', name: 'requisition_id' })
  requisitionId: string;

  @Column({ type: 'varchar', length: 100, name: 'assessment_number', unique: true })
  @Index()
  assessmentNumber: string;

  // Assessment Details
  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 50, name: 'assessment_type' })
  assessmentType: string; // technical, cognitive, personality, skills, language, culture_fit

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  provider: string; // Codility, HackerRank, TestGorilla, internal, etc.

  @Column({ type: 'varchar', length: 200, name: 'external_assessment_id', nullable: true })
  externalAssessmentId: string;

  // Configuration
  @Column({ type: 'int', name: 'time_limit_minutes', nullable: true })
  timeLimitMinutes: number;

  @Column({ type: 'int', name: 'questions_count', nullable: true })
  questionsCount: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  difficulty: string; // easy, medium, hard, expert

  @Column({ type: 'jsonb', name: 'skills_tested', default: [] })
  skillsTested: string[];

  @Column({ type: 'jsonb', default: [] })
  topics: string[];

  // Scoring
  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'max_score', default: 100 })
  maxScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'passing_score' })
  passingScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  percentile: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  grade: string; // A+, A, B+, B, C, etc.

  @Column({ type: 'boolean', nullable: true })
  passed: boolean;

  // Results
  @Column({ type: 'jsonb', name: 'results_summary', default: {} })
  resultsSummary: {
    overallScore?: number;
    sectionScores?: Record<string, number>;
    strengthAreas?: string[];
    weaknessAreas?: string[];
    timeSpent?: number;
    questionsAttempted?: number;
    correctAnswers?: number;
  };

  @Column({ type: 'jsonb', name: 'detailed_results', default: {} })
  detailedResults: {
    sections?: Array<{
      name: string;
      score: number;
      maxScore: number;
      percentile?: number;
      questions?: any[];
    }>;
    competencies?: Record<string, number>;
    comparisons?: {
      averageScore?: number;
      topScore?: number;
      position?: string;
    };
  };

  // Status
  @Column({ type: 'varchar', length: 50, default: 'not_sent' })
  @Index()
  status: string; // not_sent, invited, in_progress, completed, expired, cancelled, failed

  // Timeline
  @Column({ type: 'timestamp', name: 'sent_at', nullable: true })
  sentAt: Date;

  @Column({ type: 'timestamp', name: 'started_at', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', name: 'completed_at', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', name: 'expires_at', nullable: true })
  expiresAt: Date;

  @Column({ type: 'int', name: 'valid_for_days', default: 7 })
  validForDays: number;

  @Column({ type: 'int', name: 'time_spent_minutes', nullable: true })
  timeSpentMinutes: number;

  // Access
  @Column({ type: 'varchar', length: 500, name: 'assessment_url', nullable: true })
  assessmentUrl: string;

  @Column({ type: 'varchar', length: 200, name: 'access_code', nullable: true })
  accessCode: string;

  @Column({ type: 'varchar', length: 200, name: 'access_token', nullable: true })
  accessToken: string;

  // Attempts
  @Column({ type: 'int', name: 'attempts_allowed', default: 1 })
  attemptsAllowed: number;

  @Column({ type: 'int', name: 'attempts_used', default: 0 })
  attemptsUsed: number;

  @Column({ type: 'boolean', name: 'retake_allowed', default: false })
  retakeAllowed: boolean;

  @Column({ type: 'jsonb', name: 'attempt_history', default: [] })
  attemptHistory: Array<{
    attemptNumber: number;
    startedAt: Date;
    completedAt?: Date;
    score?: number;
    status: string;
  }>;

  // Proctoring
  @Column({ type: 'boolean', name: 'is_proctored', default: false })
  isProctored: boolean;

  @Column({ type: 'varchar', length: 50, name: 'proctoring_type', nullable: true })
  proctoringType: string; // live, ai, none

  @Column({ type: 'jsonb', name: 'proctoring_events', default: [] })
  proctoringEvents: Array<{
    timestamp: Date;
    event: string;
    severity?: string;
    details?: any;
  }>;

  @Column({ type: 'boolean', name: 'cheating_suspected', default: false })
  cheatingSuspected: boolean;

  @Column({ type: 'text', name: 'cheating_notes', nullable: true })
  cheatingNotes: string;

  // Technical Details
  @Column({ type: 'varchar', length: 100, name: 'device_type', nullable: true })
  deviceType: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  browser: string;

  @Column({ type: 'varchar', length: 100, name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string;

  // Notifications
  @Column({ type: 'boolean', name: 'invitation_sent', default: false })
  invitationSent: boolean;

  @Column({ type: 'int', name: 'reminder_sent_count', default: 0 })
  reminderSentCount: number;

  @Column({ type: 'timestamp', name: 'last_reminder_sent_at', nullable: true })
  lastReminderSentAt: Date;

  // Feedback
  @Column({ type: 'text', name: 'candidate_feedback', nullable: true })
  candidateFeedback: string;

  @Column({ type: 'int', name: 'candidate_rating', nullable: true })
  candidateRating: number;

  // Review
  @Column({ type: 'boolean', name: 'requires_manual_review', default: false })
  requiresManualReview: boolean;

  @Column({ type: 'boolean', name: 'is_reviewed', default: false })
  isReviewed: boolean;

  @Column({ type: 'uuid', name: 'reviewed_by', nullable: true })
  reviewedBy: string;

  @Column({ type: 'timestamp', name: 'reviewed_at', nullable: true })
  reviewedAt: Date;

  @Column({ type: 'text', name: 'reviewer_notes', nullable: true })
  reviewerNotes: string;

  // Integration
  @Column({ type: 'jsonb', name: 'integration_data', default: {} })
  integrationData: {
    providerId?: string;
    externalId?: string;
    webhookData?: any;
    syncStatus?: string;
    lastSyncAt?: Date;
  };

  // Cost
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number;

  @Column({ type: 'varchar', length: 3, nullable: true })
  currency: string;

  // Documents
  @Column({ type: 'jsonb', default: [] })
  documents: Array<{
    id: string;
    type: string;
    name: string;
    url: string;
    uploadedAt: Date;
  }>;

  // Notes
  @Column({ type: 'text', nullable: true })
  notes: string;

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
