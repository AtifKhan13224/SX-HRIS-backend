import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('role_categories')
export class RoleCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'category_code', unique: true })
  categoryCode: string;

  @Column({ name: 'category_name' })
  categoryName: string;

  @Column({ name: 'category_description', type: 'text', nullable: true })
  categoryDescription: string;

  @Column({ name: 'group_company_id', nullable: true })
  groupCompanyId: string;

  @Column({ name: 'group_company', nullable: true })
  groupCompany: string;

  @Column({ name: 'parent_category_id', nullable: true })
  parentCategoryId: string;

  @Column({ name: 'parent_category', nullable: true })
  parentCategory: string;

  @Column({ name: 'category_level', type: 'int', default: 1 })
  categoryLevel: number;

  @Column({ name: 'category_type', nullable: true })
  categoryType: string;

  @Column({ name: 'role_classification', nullable: true })
  roleClassification: string;

  @Column({ name: 'employment_type', nullable: true })
  employmentType: string;

  @Column({ name: 'seniority_level', nullable: true })
  seniorityLevel: string;

  @Column({ name: 'management_level', nullable: true })
  managementLevel: string;

  @Column({ name: 'responsibility_level', nullable: true })
  responsibilityLevel: string;

  @Column({ name: 'decision_authority', nullable: true })
  decisionAuthority: string;

  @Column({ name: 'span_of_control_min', type: 'int', nullable: true })
  spanOfControlMin: number;

  @Column({ name: 'span_of_control_max', type: 'int', nullable: true })
  spanOfControlMax: number;

  @Column({ name: 'budget_authority_min', type: 'decimal', precision: 15, scale: 2, nullable: true })
  budgetAuthorityMin: number;

  @Column({ name: 'budget_authority_max', type: 'decimal', precision: 15, scale: 2, nullable: true })
  budgetAuthorityMax: number;

  @Column({ name: 'budget_currency', default: 'USD' })
  budgetCurrency: string;

  @Column({ name: 'compensation_grade_min', nullable: true })
  compensationGradeMin: string;

  @Column({ name: 'compensation_grade_max', nullable: true })
  compensationGradeMax: string;

  @Column({ name: 'salary_range_min', type: 'decimal', precision: 15, scale: 2, nullable: true })
  salaryRangeMin: number;

  @Column({ name: 'salary_range_max', type: 'decimal', precision: 15, scale: 2, nullable: true })
  salaryRangeMax: number;

  @Column({ name: 'salary_currency', default: 'USD' })
  salaryCurrency: string;

  @Column({ name: 'career_track', nullable: true })
  careerTrack: string;

  @Column({ name: 'career_path', type: 'simple-json', nullable: true })
  careerPath: {
    previousRole: string;
    currentRole: string;
    nextRole: string;
    alternativePaths: string[];
  };

  @Column({ name: 'required_education', nullable: true })
  requiredEducation: string;

  @Column({ name: 'preferred_education', nullable: true })
  preferredEducation: string;

  @Column({ name: 'required_experience_years', type: 'int', nullable: true })
  requiredExperienceYears: number;

  @Column({ name: 'required_certifications', type: 'simple-array', nullable: true })
  requiredCertifications: string[];

  @Column({ name: 'preferred_certifications', type: 'simple-array', nullable: true })
  preferredCertifications: string[];

  @Column({ name: 'core_competencies', type: 'simple-array', nullable: true })
  coreCompetencies: string[];

  @Column({ name: 'technical_skills', type: 'simple-array', nullable: true })
  technicalSkills: string[];

  @Column({ name: 'soft_skills', type: 'simple-array', nullable: true })
  softSkills: string[];

  @Column({ name: 'languages_required', type: 'simple-array', nullable: true })
  languagesRequired: string[];

  @Column({ name: 'performance_indicators', type: 'simple-json', nullable: true })
  performanceIndicators: {
    kpiName: string;
    target: string;
    weight: number;
  }[];

  @Column({ name: 'work_schedule', nullable: true })
  workSchedule: string;

  @Column({ name: 'work_location_type', nullable: true })
  workLocationType: string;

  @Column({ name: 'travel_requirement', nullable: true })
  travelRequirement: string;

  @Column({ name: 'shift_eligibility', type: 'boolean', default: false })
  shiftEligibility: boolean;

  @Column({ name: 'overtime_eligible', type: 'boolean', default: false })
  overtimeEligible: boolean;

  @Column({ name: 'remote_work_eligible', type: 'boolean', default: false })
  remoteWorkEligible: boolean;

  @Column({ name: 'hybrid_work_eligible', type: 'boolean', default: false })
  hybridWorkEligible: boolean;

  @Column({ name: 'international_assignment_eligible', type: 'boolean', default: false })
  internationalAssignmentEligible: boolean;

  @Column({ name: 'relocation_eligible', type: 'boolean', default: false })
  relocationEligible: boolean;

  @Column({ name: 'geographic_scope', type: 'simple-array', nullable: true })
  geographicScope: string[];

  @Column({ name: 'role_count_current', type: 'int', default: 0 })
  roleCountCurrent: number;

  @Column({ name: 'role_count_budgeted', type: 'int', default: 0 })
  roleCountBudgeted: number;

  @Column({ name: 'headcount_current', type: 'int', default: 0 })
  headcountCurrent: number;

  @Column({ name: 'headcount_budgeted', type: 'int', default: 0 })
  headcountBudgeted: number;

  @Column({ name: 'open_positions', type: 'int', default: 0 })
  openPositions: number;

  @Column({ name: 'avg_time_to_fill', type: 'int', nullable: true })
  avgTimeToFill: number;

  @Column({ name: 'avg_cost_per_hire', type: 'decimal', precision: 15, scale: 2, nullable: true })
  avgCostPerHire: number;

  @Column({ name: 'turnover_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  turnoverRate: number;

  @Column({ name: 'retention_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  retentionRate: number;

  @Column({ name: 'internal_fill_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  internalFillRate: number;

  @Column({ name: 'succession_bench_strength', type: 'int', default: 0 })
  successionBenchStrength: number;

  @Column({ name: 'high_potential_count', type: 'int', default: 0 })
  highPotentialCount: number;

  @Column({ name: 'avg_performance_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  avgPerformanceRating: number;

  @Column({ name: 'compliance_requirements', type: 'simple-json', nullable: true })
  complianceRequirements: {
    regulatoryBody: string;
    requirement: string;
    mandatory: boolean;
  }[];

  @Column({ name: 'safety_requirements', type: 'simple-array', nullable: true })
  safetyRequirements: string[];

  @Column({ name: 'security_clearance', nullable: true })
  securityClearance: string;

  @Column({ name: 'background_check_level', nullable: true })
  backgroundCheckLevel: string;

  @Column({ name: 'criticality_rating', nullable: true })
  criticalityRating: string;

  @Column({ name: 'strategic_importance', nullable: true })
  strategicImportance: string;

  @Column({ name: 'business_impact', nullable: true })
  businessImpact: string;

  @Column({ name: 'automation_risk', nullable: true })
  automationRisk: string;

  @Column({ name: 'future_demand_trend', nullable: true })
  futureDemandTrend: string;

  @Column({ name: 'market_availability', nullable: true })
  marketAvailability: string;

  @Column({ name: 'diversity_targets', type: 'simple-json', nullable: true })
  diversityTargets: {
    metric: string;
    target: number;
    current: number;
  }[];

  @Column({ name: 'esg_alignment', type: 'simple-array', nullable: true })
  esgAlignment: string[];

  @Column({ name: 'reporting_relationship', nullable: true })
  reportingRelationship: string;

  @Column({ name: 'typical_reports_to', nullable: true })
  typicalReportsTo: string;

  @Column({ name: 'category_owner', nullable: true })
  categoryOwner: string;

  @Column({ name: 'category_owner_email', nullable: true })
  categoryOwnerEmail: string;

  @Column({ name: 'hr_business_partner', nullable: true })
  hrBusinessPartner: string;

  @Column({ name: 'talent_acquisition_lead', nullable: true })
  talentAcquisitionLead: string;

  @Column({ name: 'last_review_date', type: 'date', nullable: true })
  lastReviewDate: Date;

  @Column({ name: 'next_review_date', type: 'date', nullable: true })
  nextReviewDate: Date;

  @Column({ name: 'effective_date', type: 'date', nullable: true })
  effectiveDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @Column({ name: 'version', type: 'int', default: 1 })
  version: number;

  @Column({ name: 'change_log', type: 'simple-json', nullable: true })
  changeLog: {
    date: string;
    changedBy: string;
    changes: string;
  }[];

  @Column({ name: 'tags', type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'custom_fields', type: 'simple-json', nullable: true })
  customFields: { [key: string]: any };

  @Column({ name: 'auto_numbering', type: 'boolean', default: false })
  autoNumbering: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_critical', type: 'boolean', default: false })
  isCritical: boolean;

  @Column({ name: 'is_strategic', type: 'boolean', default: false })
  isStrategic: boolean;

  @Column({ name: 'is_leadership', type: 'boolean', default: false })
  isLeadership: boolean;

  @Column({ name: 'is_public_facing', type: 'boolean', default: false })
  isPublicFacing: boolean;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
