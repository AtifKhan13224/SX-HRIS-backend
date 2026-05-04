import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Employee } from '../../employees/entities/employee.entity';

export enum ReviewCycle {
  QUARTERLY = 'quarterly',
  SEMI_ANNUAL = 'semi_annual',
  ANNUAL = 'annual',
}

export enum ReviewStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  SELF_REVIEW_COMPLETED = 'self_review_completed',
  MANAGER_REVIEW_COMPLETED = 'manager_review_completed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum GoalStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

@Entity('performance_reviews')
@Index(['employeeId', 'reviewPeriod'])
@Index(['status', 'reviewPeriod'])
export class PerformanceReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'employee_id' })
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'reviewer_id' })
  reviewerId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: Employee;

  @Column({ name: 'review_period' })
  reviewPeriod: string;

  @Column({
    type: 'enum',
    enum: ReviewCycle,
  })
  reviewCycle: ReviewCycle;

  @Column({ type: 'date', name: 'review_start_date' })
  reviewStartDate: Date;

  @Column({ type: 'date', name: 'review_end_date' })
  reviewEndDate: Date;

  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.NOT_STARTED,
  })
  status: ReviewStatus;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true, name: 'self_rating' })
  selfRating: number;

  @Column({ type: 'text', nullable: true, name: 'self_comments' })
  selfComments: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true, name: 'manager_rating' })
  managerRating: number;

  @Column({ type: 'text', nullable: true, name: 'manager_comments' })
  managerComments: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true, name: 'final_rating' })
  finalRating: number;

  @Column({ type: 'jsonb', nullable: true, name: 'competency_ratings' })
  competencyRatings: Record<string, number>;

  @Column({ type: 'text', nullable: true, name: 'strengths' })
  strengths: string;

  @Column({ type: 'text', nullable: true, name: 'areas_of_improvement' })
  areasOfImprovement: string;

  @Column({ type: 'text', nullable: true, name: 'development_plan' })
  developmentPlan: string;

  @Column({ name: 'self_review_completed_at', type: 'timestamp', nullable: true })
  selfReviewCompletedAt: Date;

  @Column({ name: 'manager_review_completed_at', type: 'timestamp', nullable: true })
  managerReviewCompletedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('performance_goals')
@Index(['employeeId', 'status'])
export class PerformanceGoal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'employee_id' })
  employeeId: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'goal_title' })
  goalTitle: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'date', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'date', name: 'target_date' })
  targetDate: Date;

  @Column({
    type: 'enum',
    enum: GoalStatus,
    default: GoalStatus.NOT_STARTED,
  })
  status: GoalStatus;

  @Column({ type: 'integer', default: 0 })
  progress: number;

  @Column({ type: 'text', nullable: true, name: 'success_criteria' })
  successCriteria: string;

  @Column({ name: 'assigned_by', nullable: true })
  assignedBy: string;

  @Column({ type: 'date', nullable: true, name: 'completed_date' })
  completedDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('performance_competencies')
export class PerformanceCompetency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'competency_name' })
  competencyName: string;

  @Column({ name: 'competency_code', unique: true })
  competencyCode: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  category: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true, name: 'rating_scale' })
  ratingScale: Record<string, string>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
