import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Interview Evaluation Entity
 * Structured feedback and scoring from interviewers
 * Enterprise-grade evaluation management
 */
@Entity('interview_evaluations')
@Index(['interviewId'])
@Index(['evaluatorId'])
@Index(['applicationId'])
export class InterviewEvaluation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'interview_id' })
  @Index()
  interviewId: string;

  @Column({ type: 'uuid', name: 'application_id' })
  @Index()
  applicationId: string;

  @Column({ type: 'uuid', name: 'candidate_id' })
  candidateId: string;

  @Column({ type: 'uuid', name: 'evaluator_id' })
  @Index()
  evaluatorId: string;

  @Column({ type: 'varchar', length: 200, name: 'evaluator_name' })
  evaluatorName: string;

  @Column({ type: 'varchar', length: 100, name: 'evaluator_role' })
  evaluatorRole: string;

  // Overall Assessment
  @Column({ type: 'varchar', length: 50 })
  recommendation: string; // strong_hire, hire, maybe, no_hire, strong_no_hire

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'overall_score' })
  overallScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'max_overall_score', default: 5 })
  maxOverallScore: number;

  // Competency Ratings
  @Column({ type: 'jsonb', default: [] })
  competencies: Array<{
    id: string;
    name: string;
    category: string;
    score: number;
    maxScore: number;
    weight: number;
    comments?: string;
    examples?: string;
  }>;

  // Detailed Evaluation
  @Column({ type: 'jsonb', name: 'technical_skills', default: {} })
  technicalSkills: {
    score: number;
    maxScore: number;
    skills: Array<{
      name: string;
      rating: number;
      notes?: string;
    }>;
    comments?: string;
  };

  @Column({ type: 'jsonb', name: 'communication_skills', default: {} })
  communicationSkills: {
    score: number;
    maxScore: number;
    clarity: number;
    listening: number;
    articulation: number;
    comments?: string;
  };

  @Column({ type: 'jsonb', name: 'problem_solving', default: {} })
  problemSolving: {
    score: number;
    maxScore: number;
    analyticalThinking: number;
    creativity: number;
    approach: number;
    comments?: string;
  };

  @Column({ type: 'jsonb', name: 'cultural_fit', default: {} })
  culturalFit: {
    score: number;
    maxScore: number;
    values: number;
    teamwork: number;
    adaptability: number;
    comments?: string;
  };

  @Column({ type: 'jsonb', default: {} })
  leadership: {
    score: number;
    maxScore: number;
    vision: number;
    influence: number;
    decisionMaking: number;
    comments?: string;
  };

  @Column({ type: 'jsonb', name: 'domain_expertise', default: {} })
  domainExpertise: {
    score: number;
    maxScore: number;
    depth: number;
    breadth: number;
    practical: number;
    comments?: string;
  };

  // Interview Questions
  @Column({ type: 'jsonb', name: 'questions_asked', default: [] })
  questionsAsked: Array<{
    id: string;
    question: string;
    type: string;
    candidateAnswer: string;
    score?: number;
    evaluation?: string;
  }>;

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
    concern: 'minor' | 'moderate' | 'major';
    examples?: string;
  }>;

  @Column({ type: 'jsonb', name: 'red_flags', default: [] })
  redFlags: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;

  // Comments
  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ type: 'text', name: 'private_notes', nullable: true })
  privateNotes: string;

  @Column({ type: 'text', name: 'next_steps_recommendation', nullable: true })
  nextStepsRecommendation: string;

  // Comparisons
  @Column({ type: 'varchar', length: 50, name: 'comparison_to_job_requirements', nullable: true })
  comparisonToJobRequirements: string; // exceeds, meets, partially_meets, does_not_meet

  @Column({ type: 'varchar', length: 50, name: 'comparison_to_other_candidates', nullable: true })
  comparisonToOtherCandidates: string; // top_tier, above_average, average, below_average

  // Concerns & Reservations
  @Column({ type: 'boolean', name: 'has_reservations', default: false })
  hasReservations: boolean;

  @Column({ type: 'text', nullable: true })
  reservations: string;

  @Column({ type: 'boolean', name: 'would_work_with_candidate', default: true })
  wouldWorkWithCandidate: boolean;

  // Salary
  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'recommended_salary', nullable: true })
  recommendedSalary: number;

  @Column({ type: 'varchar', length: 3, name: 'salary_currency', nullable: true })
  salaryCurrency: string;

  @Column({ type: 'text', name: 'salary_justification', nullable: true })
  salaryJustification: string;

  // Level Assessment
  @Column({ type: 'varchar', length: 100, name: 'suggested_level', nullable: true })
  suggestedLevel: string;

  @Column({ type: 'boolean', name: 'level_differs_from_requisition', default: false })
  levelDiffersFromRequisition: boolean;

  @Column({ type: 'text', name: 'level_difference_justification', nullable: true })
  levelDifferenceJustification: string;

  // Completed
  @Column({ type: 'boolean', name: 'is_submitted', default: false })
  isSubmitted: boolean;

  @Column({ type: 'timestamp', name: 'submitted_at', nullable: true })
  submittedAt: Date;

  @Column({ type: 'boolean', name: 'is_draft', default: true })
  isDraft: boolean;

  // Visibility
  @Column({ type: 'boolean', name: 'visible_to_candidate', default: false })
  visibleToCandidate: boolean;

  @Column({ type: 'boolean', name: 'visible_to_hiring_manager', default: true })
  visibleToHiringManager: boolean;

  // Attachments
  @Column({ type: 'jsonb', default: [] })
  attachments: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: Date;
  }>;

  // Time Tracking
  @Column({ type: 'int', name: 'evaluation_duration_minutes', nullable: true })
  evaluationDurationMinutes: number;

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
