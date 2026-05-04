import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { GroupCompany } from './group-company.entity';

@Entity('functional_areas')
export class FunctionalArea {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  areaCode: string;

  @Column()
  areaName: string;

  @Column({ type: 'text', nullable: true })
  areaDescription: string;

  // Hierarchy
  @Column({ nullable: true })
  groupCompanyId: string;

  @ManyToOne(() => GroupCompany, { nullable: true })
  @JoinColumn({ name: 'groupCompanyId' })
  groupCompany: GroupCompany;

  @Column({ nullable: true })
  parentAreaId: string;

  @Column({ type: 'int', nullable: true, default: 1 })
  areaLevel: number;

  // Classification
  @Column({ nullable: true })
  areaType: string; // Primary, Support, Strategic, Operational, Administrative

  @Column({ nullable: true })
  businessFunction: string; // HR, Finance, IT, Operations, Sales, Marketing, etc.

  @Column({ type: 'boolean', default: false })
  isCore: boolean;

  @Column({ type: 'boolean', default: false })
  isRevenue: boolean;

  @Column({ type: 'boolean', default: false })
  isSupport: boolean;

  // Organizational Impact
  @Column({ nullable: true })
  strategicImportance: string; // Critical, High, Medium, Low

  @Column({ nullable: true })
  businessImpact: string; // Direct, Indirect, Support

  @Column({ type: 'int', nullable: true })
  priorityLevel: number; // 1-10

  // Headcount & Budget
  @Column({ type: 'int', nullable: true, default: 0 })
  headcountCurrent: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  headcountBudgeted: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  annualBudget: number;

  @Column({ nullable: true, default: 'USD' })
  budgetCurrency: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  actualSpend: number;

  // Performance Metrics
  @Column({ type: 'simple-array', nullable: true })
  kpiMetrics: string[];

  @Column({ type: 'jsonb', nullable: true })
  performanceTargets: {
    metric: string;
    target: number;
    actual: number;
    unit: string;
  }[];

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  efficiencyScore: number; // 0-100

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  productivityScore: number; // 0-100

  // Capabilities & Skills
  @Column({ type: 'simple-array', nullable: true })
  coreCapabilities: string[];

  @Column({ type: 'simple-array', nullable: true })
  requiredSkills: string[];

  @Column({ type: 'simple-array', nullable: true })
  certifications: string[];

  // Technology & Tools
  @Column({ type: 'simple-array', nullable: true })
  toolsUsed: string[];

  @Column({ type: 'simple-array', nullable: true })
  systemsManaged: string[];

  @Column({ type: 'jsonb', nullable: true })
  technologyStack: {
    category: string;
    tools: string[];
  }[];

  // Risk & Compliance
  @Column({ nullable: true })
  riskLevel: string; // Critical, High, Medium, Low

  @Column({ type: 'simple-array', nullable: true })
  complianceRequirements: string[];

  @Column({ type: 'simple-array', nullable: true })
  regulatoryBodies: string[];

  @Column({ type: 'boolean', default: false })
  auditRequired: boolean;

  @Column({ type: 'date', nullable: true })
  lastAuditDate: Date;

  @Column({ type: 'date', nullable: true })
  nextAuditDate: Date;

  // Geographic Scope
  @Column({ type: 'simple-array', nullable: true })
  geographicCoverage: string[];

  @Column({ nullable: true })
  locationScope: string; // Global, Regional, National, Local

  @Column({ type: 'simple-array', nullable: true })
  operatingRegions: string[];

  // Stakeholders
  @Column({ nullable: true })
  areaHead: string;

  @Column({ nullable: true })
  areaHeadEmail: string;

  @Column({ nullable: true })
  functionalLead: string;

  @Column({ nullable: true })
  hrBusinessPartner: string;

  @Column({ type: 'simple-array', nullable: true })
  keyStakeholders: string[];

  // Service Level
  @Column({ type: 'jsonb', nullable: true })
  slaTargets: {
    metric: string;
    target: string;
    actual: string;
  }[];

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  customerSatisfactionScore: number;

  @Column({ type: 'int', nullable: true })
  avgResponseTime: number; // in hours

  // Transformation & Future
  @Column({ nullable: true })
  automationPotential: string; // High, Medium, Low

  @Column({ nullable: true })
  digitalizationStatus: string; // Advanced, Moderate, Basic, Manual

  @Column({ type: 'jsonb', nullable: true })
  transformationRoadmap: {
    initiative: string;
    timeline: string;
    status: string;
  }[];

  @Column({ type: 'simple-array', nullable: true })
  futureCapabilities: string[];

  // Collaboration
  @Column({ type: 'simple-array', nullable: true })
  dependentAreas: string[];

  @Column({ type: 'simple-array', nullable: true })
  supportedAreas: string[];

  @Column({ type: 'jsonb', nullable: true })
  crossFunctionalProjects: {
    projectName: string;
    partners: string[];
    status: string;
  }[];

  // Cost Management
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  costPerEmployee: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  costPerOutput: number;

  @Column({ type: 'jsonb', nullable: true })
  costBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];

  // Quality Metrics
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  qualityScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  errorRate: number;

  @Column({ type: 'int', nullable: true })
  defectCount: number;

  // Metadata
  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  customFields: { [key: string]: any };

  // Status & Dates
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isCritical: boolean;

  @Column({ type: 'boolean', default: false })
  isStrategic: boolean;

  @Column({ type: 'date', nullable: true })
  establishedDate: Date;

  @Column({ type: 'date', nullable: true })
  lastReviewDate: Date;

  @Column({ type: 'date', nullable: true })
  nextReviewDate: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
