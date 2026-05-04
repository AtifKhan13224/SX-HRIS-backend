import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Reference Check Entity
 * Reference verification with structured questions
 * Enterprise-grade reference checking
 */
@Entity('reference_checks')
@Index(['companyId'])
@Index(['applicationId'])
@Index(['candidateId'])
@Index(['status'])
export class ReferenceCheck {
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

  @Column({ type: 'varchar', length: 100, name: 'reference_number', unique: true })
  @Index()
  referenceNumber: string;

  // Reference Contact Information
  @Column({ type: 'varchar', length: 100, name: 'reference_name' })
  referenceName: string;

  @Column({ type: 'varchar', length: 200 })
  email: string;

  @Column({ type: 'varchar', length: 50, name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  company: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  position: string;

  @Column({ type: 'varchar', length: 100 })
  relationship: string; // Direct Manager, Colleague, Client, etc.

  @Column({ type: 'int', name: 'years_known', nullable: true })
  yearsKnown: number;

  @Column({ type: 'text', name: 'relationship_context', nullable: true })
  relationshipContext: string;

  // Contact Preference
  @Column({ type: 'varchar', length: 50, name: 'preferred_contact_method', default: 'email' })
  preferredContactMethod: string; // email, phone, both

  @Column({ type: 'varchar', length: 100, name: 'best_time_to_contact', nullable: true })
  bestTimeToContact: string;

  // Status
  @Column({ type: 'varchar', length: 50, default: 'pending' })
  @Index()
  status: string; // pending, contacted, in_progress, completed, declined, unreachable, cancelled

  // Timeline
  @Column({ type: 'timestamp', name: 'requested_at' })
  requestedAt: Date;

  @Column({ type: 'timestamp', name: 'contacted_at', nullable: true })
  contactedAt: Date;

  @Column({ type: 'timestamp', name: 'completed_at', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', name: 'declined_at', nullable: true })
  declinedAt: Date;

  @Column({ type: 'text', name: 'decline_reason', nullable: true })
  declineReason: string;

  // Contact Attempts
  @Column({ type: 'int', name: 'contact_attempts', default: 0 })
  contactAttempts: number;

  @Column({ type: 'timestamp', name: 'last_contact_attempt', nullable: true })
  lastContactAttempt: Date;

  @Column({ type: 'jsonb', name: 'contact_history', default: [] })
  contactHistory: Array<{
    attemptNumber: number;
    method: string;
    timestamp: Date;
    outcome: string;
    notes?: string;
  }>;

  // Check Method
  @Column({ type: 'varchar', length: 50, name: 'check_method' })
  checkMethod: string; // phone, email, form, video_call, in_person

  @Column({ type: 'varchar', length: 500, name: 'reference_form_url', nullable: true })
  referenceFormUrl: string;

  @Column({ type: 'varchar', length: 200, name: 'access_token', nullable: true })
  accessToken: string;

  // Conducted By
  @Column({ type: 'uuid', name: 'conducted_by', nullable: true })
  conductedBy: string;

  @Column({ type: 'varchar', length: 200, name: 'conducted_by_name', nullable: true })
  conductedByName: string;

  @Column({ type: 'int', name: 'call_duration_minutes', nullable: true })
  callDurationMinutes: number;

  // Questions & Responses
  @Column({ type: 'jsonb', default: [] })
  questions: Array<{
    id: string;
    category: string;
    question: string;
    type: 'rating' | 'text' | 'boolean' | 'select';
    answer?: any;
    rating?: number;
    comments?: string;
  }>;

  // Performance Ratings
  @Column({ type: 'jsonb', name: 'performance_ratings', default: {} })
  performanceRatings: {
    overall?: number;
    technicalSkills?: number;
    communication?: number;
    teamwork?: number;
    leadership?: number;
    reliability?: number;
    problemSolving?: number;
    workEthic?: number;
    adaptability?: number;
  };

  // Employment Verification
  @Column({ type: 'boolean', name: 'employment_verified', nullable: true })
  employmentVerified: boolean;

  @Column({ type: 'varchar', length: 200, name: 'verified_job_title', nullable: true })
  verifiedJobTitle: string;

  @Column({ type: 'date', name: 'verified_start_date', nullable: true })
  verifiedStartDate: Date;

  @Column({ type: 'date', name: 'verified_end_date', nullable: true })
  verifiedEndDate: Date;

  @Column({ type: 'varchar', length: 100, name: 'verified_final_salary', nullable: true })
  verifiedFinalSalary: string;

  @Column({ type: 'varchar', length: 100, name: 'reason_for_leaving', nullable: true })
  reasonForLeaving: string;

  @Column({ type: 'boolean', name: 'eligible_for_rehire', nullable: true })
  eligibleForRehire: boolean;

  @Column({ type: 'text', name: 'rehire_explanation', nullable: true })
  rehireExplanation: string;

  // Strengths & Weaknesses
  @Column({ type: 'jsonb', default: [] })
  strengths: Array<{
    area: string;
    description: string;
    examples?: string;
  }>;

  @Column({ type: 'jsonb', default: [] })
  weaknesses: Array<{
    area: string;
    description: string;
    concern?: string;
  }>;

  @Column({ type: 'text', name: 'key_achievements', nullable: true })
  keyAchievements: string;

  @Column({ type: 'text', name: 'areas_for_improvement', nullable: true })
  areasForImprovement: string;

  // Overall Assessment
  @Column({ type: 'varchar', length: 50, nullable: true })
  recommendation: string; // highly_recommend, recommend, recommend_with_reservations, do_not_recommend

  @Column({ type: 'decimal', precision: 3, scale: 2, name: 'overall_rating', nullable: true })
  overallRating: number;

  @Column({ type: 'text', name: 'overall_comments', nullable: true })
  overallComments: string;

  @Column({ type: 'text', name: 'additional_comments', nullable: true })
  additionalComments: string;

  // Red Flags
  @Column({ type: 'jsonb', name: 'red_flags', default: [] })
  redFlags: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;

  @Column({ type: 'boolean', name: 'has_concerns', default: false })
  hasConcerns: boolean;

  @Column({ type: 'text', nullable: true })
  concerns: string;

  // Comparison
  @Column({ type: 'varchar', length: 100, name: 'comparison_to_peers', nullable: true })
  comparisonToPeers: string; // top_performer, above_average, average, below_average

  @Column({ type: 'varchar', length: 100, name: 'work_style', nullable: true })
  workStyle: string;

  @Column({ type: 'varchar', length: 100, name: 'management_style', nullable: true })
  managementStyle: string;

  // Specific Feedback
  @Column({ type: 'text', name: 'collaboration_feedback', nullable: true })
  collaborationFeedback: string;

  @Column({ type: 'text', name: 'conflict_resolution_feedback', nullable: true })
  conflictResolutionFeedback: string;

  @Column({ type: 'text', name: 'pressure_handling_feedback', nullable: true })
  pressureHandlingFeedback: string;

  // Recommendations for Future Role
  @Column({ type: 'text', name: 'advice_for_future_manager', nullable: true })
  adviceForFutureManager: string;

  @Column({ type: 'text', name: 'best_role_fit', nullable: true })
  bestRoleFit: string;

  // Consent & Compliance
  @Column({ type: 'boolean', name: 'consent_obtained', default: false })
  consentObtained: boolean;

  @Column({ type: 'timestamp', name: 'consent_obtained_at', nullable: true })
  consentObtainedAt: Date;

  @Column({ type: 'boolean', name: 'reference_consent_given', default: false })
  referenceConsentGiven: boolean;

  // Recording
  @Column({ type: 'boolean', name: 'call_recorded', default: false })
  callRecorded: boolean;

  @Column({ type: 'varchar', length: 500, name: 'recording_url', nullable: true })
  recordingUrl: string;

  @Column({ type: 'boolean', name: 'recording_consent_obtained', default: false })
  recordingConsentObtained: boolean;

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
