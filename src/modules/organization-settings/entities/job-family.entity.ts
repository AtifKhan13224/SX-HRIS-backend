import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity('job_families')
export class JobFamily {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'family_code', unique: true })
  familyCode: string;

  @Column({ name: 'family_name' })
  familyName: string;

  @Column({ name: 'family_description', type: 'text', nullable: true })
  familyDescription: string;

  @Column({ name: 'group_company_id', nullable: true })
  groupCompanyId: string;

  @Column({ name: 'group_company', nullable: true })
  groupCompany: string;

  @Column({ name: 'parent_family_id', nullable: true })
  parentFamilyId: string;

  @Column({ name: 'parent_family', nullable: true })
  parentFamily: string;

  @Column({ name: 'functional_area_id', nullable: true })
  functionalAreaId: string;

  @Column({ name: 'functional_area', nullable: true })
  functionalArea: string;

  @Column({ name: 'career_stream', nullable: true })
  careerStream: string;

  @Column({ name: 'job_track', nullable: true })
  jobTrack: string;

  @Column({ name: 'classification', nullable: true })
  classification: string;

  @Column({ name: 'flsa_status', nullable: true })
  flsaStatus: string;

  @Column({ name: 'level_structure', type: 'simple-json', nullable: true })
  levelStructure: {
    minLevel: number;
    maxLevel: number;
    levelNames: string[];
  };

  @Column({ name: 'industry_standard_name', nullable: true })
  industryStandardName: string;

  @Column({ name: 'onet_code', nullable: true })
  onetCode: string;

  @Column({ name: 'isco_code', nullable: true })
  iscoCode: string;

  @Column({ name: 'soc_code', nullable: true })
  socCode: string;

  @Column({ name: 'skills_framework', type: 'simple-json', nullable: true })
  skillsFramework: {
    coreSkills: string[];
    technicalSkills: string[];
    leadershipSkills: string[];
    certifications: string[];
  };

  @Column({ name: 'career_progression', type: 'simple-json', nullable: true })
  careerProgression: {
    entryLevel: string;
    midLevel: string;
    seniorLevel: string;
    executiveLevel: string;
    typicalYearsInLevel: number[];
  };

  @Column({ name: 'compensation_band_min', type: 'decimal', precision: 15, scale: 2, nullable: true })
  compensationBandMin: number;

  @Column({ name: 'compensation_band_max', type: 'decimal', precision: 15, scale: 2, nullable: true })
  compensationBandMax: number;

  @Column({ name: 'compensation_currency', default: 'USD' })
  compensationCurrency: string;

  @Column({ name: 'market_benchmark_source', nullable: true })
  marketBenchmarkSource: string;

  @Column({ name: 'last_market_review', type: 'date', nullable: true })
  lastMarketReview: Date;

  @Column({ name: 'next_market_review', type: 'date', nullable: true })
  nextMarketReview: Date;

  @Column({ name: 'criticality_rating', nullable: true })
  criticalityRating: string;

  @Column({ name: 'talent_pool_size', type: 'int', default: 0 })
  talentPoolSize: number;

  @Column({ name: 'succession_depth', type: 'int', default: 0 })
  successionDepth: number;

  @Column({ name: 'turnover_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  turnoverRate: number;

  @Column({ name: 'time_to_fill_avg', type: 'int', nullable: true })
  timeToFillAvg: number;

  @Column({ name: 'cost_per_hire_avg', type: 'decimal', precision: 15, scale: 2, nullable: true })
  costPerHireAvg: number;

  @Column({ name: 'headcount_current', type: 'int', default: 0 })
  headcountCurrent: number;

  @Column({ name: 'headcount_budgeted', type: 'int', default: 0 })
  headcountBudgeted: number;

  @Column({ name: 'open_positions', type: 'int', default: 0 })
  openPositions: number;

  @Column({ name: 'geographic_distribution', type: 'simple-json', nullable: true })
  geographicDistribution: {
    region: string;
    country: string;
    headcount: number;
  }[];

  @Column({ name: 'succession_planning', type: 'simple-json', nullable: true })
  successionPlanning: {
    keyPositions: string[];
    readyNow: number;
    readyIn1Year: number;
    readyIn2Plus: number;
    noSuccessor: number;
  };

  @Column({ name: 'learning_development', type: 'simple-json', nullable: true })
  learningDevelopment: {
    requiredTraining: string[];
    recommendedCourses: string[];
    certificationPrograms: string[];
    avgTrainingHoursPerYear: number;
  };

  @Column({ name: 'compliance_requirements', type: 'simple-json', nullable: true })
  complianceRequirements: {
    licenses: string[];
    certifications: string[];
    backgroundChecks: string[];
    regulatoryBodies: string[];
  };

  @Column({ name: 'diversity_metrics', type: 'simple-json', nullable: true })
  diversityMetrics: {
    genderDistribution: { male: number; female: number; other: number };
    ageDistribution: { under30: number; age30to50: number; over50: number };
    diversityGoals: string;
  };

  @Column({ name: 'performance_metrics', type: 'simple-json', nullable: true })
  performanceMetrics: {
    avgPerformanceRating: number;
    topPerformersPercent: number;
    lowPerformersPercent: number;
    promotionRate: number;
  };

  @Column({ name: 'strategic_importance', nullable: true })
  strategicImportance: string;

  @Column({ name: 'future_demand_trend', nullable: true })
  futureDemandTrend: string;

  @Column({ name: 'automation_risk', nullable: true })
  automationRisk: string;

  @Column({ name: 'global_mobility', type: 'boolean', default: false })
  globalMobility: boolean;

  @Column({ name: 'remote_work_eligible', type: 'boolean', default: false })
  remoteWorkEligible: boolean;

  @Column({ name: 'contingent_workforce_percent', type: 'decimal', precision: 5, scale: 2, nullable: true })
  contingentWorkforcePercent: number;

  @Column({ name: 'family_lead', nullable: true })
  familyLead: string;

  @Column({ name: 'family_lead_email', nullable: true })
  familyLeadEmail: string;

  @Column({ name: 'hr_business_partner', nullable: true })
  hrBusinessPartner: string;

  @Column({ name: 'talent_acquisition_lead', nullable: true })
  talentAcquisitionLead: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'tags', type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ name: 'auto_numbering', type: 'boolean', default: false })
  autoNumbering: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_critical', type: 'boolean', default: false })
  isCritical: boolean;

  @Column({ name: 'is_strategic', type: 'boolean', default: false })
  isStrategic: boolean;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
