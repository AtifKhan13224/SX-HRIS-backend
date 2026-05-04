import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('capabilities')
export class Capability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Basic Information
  @Column({ name: 'capability_name', type: 'varchar', length: 200 })
  capabilityName: string;

  @Column({ name: 'capability_code', type: 'varchar', length: 50, unique: true })
  capabilityCode: string;

  @Column({ name: 'capability_description', type: 'text', nullable: true })
  capabilityDescription: string;

  // Classification
  @Column({ name: 'capability_type', type: 'varchar', length: 100, nullable: true })
  capabilityType: string; // Technical, Leadership, Functional, Digital, Strategic

  @Column({ name: 'capability_category', type: 'varchar', length: 100, nullable: true })
  capabilityCategory: string; // Core, Support, Strategic, Emerging

  @Column({ name: 'capability_level', type: 'varchar', length: 50, nullable: true })
  capabilityLevel: string; // Foundational, Intermediate, Advanced, Expert, Master

  @Column({ name: 'domain', type: 'varchar', length: 100, nullable: true })
  domain: string; // Technology, Business, People, Process

  @Column({ name: 'subdomain', type: 'varchar', length: 100, nullable: true })
  subdomain: string;

  // Hierarchy
  @Column({ name: 'parent_capability_id', type: 'uuid', nullable: true })
  parentCapabilityId: string;

  @ManyToOne(() => Capability, (capability) => capability.subCapabilities, { nullable: true })
  @JoinColumn({ name: 'parent_capability_id' })
  parentCapability: Capability;

  @OneToMany(() => Capability, (capability) => capability.parentCapability)
  subCapabilities: Capability[];

  @Column({ name: 'hierarchy_level', type: 'int', default: 1 })
  hierarchyLevel: number;

  @Column({ name: 'hierarchy_path', type: 'text', nullable: true })
  hierarchyPath: string;

  // Maturity & Proficiency
  @Column({ name: 'maturity_model', type: 'varchar', length: 100, nullable: true })
  maturityModel: string; // CMM, CMMI, Custom

  @Column({ name: 'current_maturity_level', type: 'int', nullable: true })
  currentMaturityLevel: number; // 1-5

  @Column({ name: 'target_maturity_level', type: 'int', nullable: true })
  targetMaturityLevel: number; // 1-5

  @Column({ name: 'proficiency_levels', type: 'jsonb', nullable: true })
  proficiencyLevels: {
    level: number;
    name: string;
    description: string;
    criteria: string[];
  }[];

  // Business Value & Strategic Alignment
  @Column({ name: 'strategic_importance', type: 'varchar', length: 50, nullable: true })
  strategicImportance: string; // Critical, High, Medium, Low

  @Column({ name: 'business_impact', type: 'varchar', length: 50, nullable: true })
  businessImpact: string; // Transformational, Significant, Moderate, Minimal

  @Column({ name: 'competitive_advantage', type: 'boolean', default: false })
  competitiveAdvantage: boolean;

  @Column({ name: 'market_differentiator', type: 'boolean', default: false })
  marketDifferentiator: boolean;

  @Column({ name: 'revenue_impact', type: 'decimal', precision: 15, scale: 2, nullable: true })
  revenueImpact: number;

  @Column({ name: 'cost_savings_potential', type: 'decimal', precision: 15, scale: 2, nullable: true })
  costSavingsPotential: number;

  // Skills & Competencies
  @Column({ name: 'required_skills', type: 'jsonb', nullable: true })
  requiredSkills: string[];

  @Column({ name: 'competency_framework', type: 'varchar', length: 100, nullable: true })
  competencyFramework: string; // O*NET, SFIA, Custom

  @Column({ name: 'certification_requirements', type: 'jsonb', nullable: true })
  certificationRequirements: {
    name: string;
    provider: string;
    level: string;
    mandatory: boolean;
  }[];

  @Column({ name: 'training_programs', type: 'jsonb', nullable: true })
  trainingPrograms: string[];

  // Workforce Planning
  @Column({ name: 'current_headcount', type: 'int', default: 0 })
  currentHeadcount: number;

  @Column({ name: 'required_headcount', type: 'int', default: 0 })
  requiredHeadcount: number;

  @Column({ name: 'headcount_gap', type: 'int', default: 0 })
  headcountGap: number;

  @Column({ name: 'attrition_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  attritionRate: number;

  @Column({ name: 'average_tenure', type: 'int', nullable: true })
  averageTenure: number; // in months

  // Supply & Demand
  @Column({ name: 'market_availability', type: 'varchar', length: 50, nullable: true })
  marketAvailability: string; // Abundant, Adequate, Scarce, Critical

  @Column({ name: 'sourcing_difficulty', type: 'varchar', length: 50, nullable: true })
  sourcingDifficulty: string; // Easy, Moderate, Difficult, Critical

  @Column({ name: 'time_to_hire_avg', type: 'int', nullable: true })
  timeToHireAvg: number; // in days

  @Column({ name: 'cost_per_hire_avg', type: 'decimal', precision: 10, scale: 2, nullable: true })
  costPerHireAvg: number;

  // Development & Investment
  @Column({ name: 'development_priority', type: 'varchar', length: 50, nullable: true })
  developmentPriority: string; // Urgent, High, Medium, Low

  @Column({ name: 'investment_required', type: 'decimal', precision: 15, scale: 2, nullable: true })
  investmentRequired: number;

  @Column({ name: 'roi_expected', type: 'decimal', precision: 5, scale: 2, nullable: true })
  roiExpected: number; // percentage

  @Column({ name: 'payback_period_months', type: 'int', nullable: true })
  paybackPeriodMonths: number;

  // Risk & Compliance
  @Column({ name: 'risk_level', type: 'varchar', length: 50, nullable: true })
  riskLevel: string; // Critical, High, Medium, Low

  @Column({ name: 'single_point_of_failure', type: 'boolean', default: false })
  singlePointOfFailure: boolean;

  @Column({ name: 'succession_plan_exists', type: 'boolean', default: false })
  successionPlanExists: boolean;

  @Column({ name: 'compliance_requirements', type: 'jsonb', nullable: true })
  complianceRequirements: string[];

  @Column({ name: 'regulatory_constraints', type: 'jsonb', nullable: true })
  regulatoryConstraints: string[];

  // Technology & Tools
  @Column({ name: 'tools_required', type: 'jsonb', nullable: true })
  toolsRequired: string[];

  @Column({ name: 'technologies', type: 'jsonb', nullable: true })
  technologies: string[];

  @Column({ name: 'platforms', type: 'jsonb', nullable: true })
  platforms: string[];

  @Column({ name: 'automation_potential', type: 'varchar', length: 50, nullable: true })
  automationPotential: string; // High, Medium, Low, None

  @Column({ name: 'ai_augmentation_score', type: 'int', nullable: true })
  aiAugmentationScore: number; // 0-100

  // Future & Innovation
  @Column({ name: 'future_relevance', type: 'varchar', length: 50, nullable: true })
  futureRelevance: string; // Growing, Stable, Declining, Obsolete

  @Column({ name: 'innovation_index', type: 'int', nullable: true })
  innovationIndex: number; // 0-100

  @Column({ name: 'emerging_trends', type: 'jsonb', nullable: true })
  emergingTrends: string[];

  @Column({ name: 'obsolescence_risk', type: 'varchar', length: 50, nullable: true })
  obsolescenceRisk: string; // High, Medium, Low, None

  @Column({ name: 'transformation_roadmap', type: 'text', nullable: true })
  transformationRoadmap: string;

  // Measurement & Analytics
  @Column({ name: 'kpis', type: 'jsonb', nullable: true })
  kpis: {
    name: string;
    target: number;
    current: number;
    unit: string;
  }[];

  @Column({ name: 'benchmarks', type: 'jsonb', nullable: true })
  benchmarks: {
    metric: string;
    industry_avg: number;
    best_in_class: number;
    our_performance: number;
  }[];

  @Column({ name: 'performance_score', type: 'int', nullable: true })
  performanceScore: number; // 0-100

  // Metadata
  @Column({ name: 'tags', type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ name: 'keywords', type: 'jsonb', nullable: true })
  keywords: string[];

  @Column({ name: 'owner_department', type: 'varchar', length: 100, nullable: true })
  ownerDepartment: string;

  @Column({ name: 'capability_owner', type: 'varchar', length: 200, nullable: true })
  capabilityOwner: string;

  @Column({ name: 'stakeholders', type: 'jsonb', nullable: true })
  stakeholders: string[];

  @Column({ name: 'last_reviewed_date', type: 'timestamp', nullable: true })
  lastReviewedDate: Date;

  @Column({ name: 'next_review_date', type: 'timestamp', nullable: true })
  nextReviewDate: Date;

  @Column({ name: 'review_frequency', type: 'varchar', length: 50, nullable: true })
  reviewFrequency: string; // Monthly, Quarterly, Semi-Annual, Annual

  // Status & Lifecycle
  @Column({ name: 'lifecycle_stage', type: 'varchar', length: 50, nullable: true })
  lifecycleStage: string; // Emerging, Growing, Mature, Declining, Retired

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_core', type: 'boolean', default: false })
  isCore: boolean;

  @Column({ name: 'is_strategic', type: 'boolean', default: false })
  isStrategic: boolean;

  @Column({ name: 'is_future_critical', type: 'boolean', default: false })
  isFutureCritical: boolean;

  @Column({ name: 'start_date', type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp', nullable: true })
  endDate: Date;

  // Audit
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'varchar', length: 100, nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'varchar', length: 100, nullable: true })
  updatedBy: string;
}
