import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsObject, IsEnum, IsDateString, Min, Max } from 'class-validator';

export class CreateFunctionalAreaDto {
  @IsString()
  areaCode: string;

  @IsString()
  areaName: string;

  @IsOptional()
  @IsString()
  areaDescription?: string;

  @IsOptional()
  @IsString()
  groupCompanyId?: string;

  @IsOptional()
  @IsString()
  parentAreaId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  areaLevel?: number;

  @IsOptional()
  @IsEnum(['Primary', 'Support', 'Strategic', 'Operational', 'Administrative'])
  areaType?: string;

  @IsOptional()
  @IsString()
  businessFunction?: string;

  @IsOptional()
  @IsBoolean()
  isCore?: boolean;

  @IsOptional()
  @IsBoolean()
  isRevenue?: boolean;

  @IsOptional()
  @IsBoolean()
  isSupport?: boolean;

  @IsOptional()
  @IsEnum(['Critical', 'High', 'Medium', 'Low'])
  strategicImportance?: string;

  @IsOptional()
  @IsEnum(['Direct', 'Indirect', 'Support'])
  businessImpact?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  priorityLevel?: number;

  @IsOptional()
  @IsNumber()
  headcountCurrent?: number;

  @IsOptional()
  @IsNumber()
  headcountBudgeted?: number;

  @IsOptional()
  @IsNumber()
  annualBudget?: number;

  @IsOptional()
  @IsString()
  budgetCurrency?: string;

  @IsOptional()
  @IsNumber()
  actualSpend?: number;

  @IsOptional()
  @IsArray()
  kpiMetrics?: string[];

  @IsOptional()
  @IsArray()
  performanceTargets?: {
    metric: string;
    target: number;
    actual: number;
    unit: string;
  }[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  efficiencyScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  productivityScore?: number;

  @IsOptional()
  @IsArray()
  coreCapabilities?: string[];

  @IsOptional()
  @IsArray()
  requiredSkills?: string[];

  @IsOptional()
  @IsArray()
  certifications?: string[];

  @IsOptional()
  @IsArray()
  toolsUsed?: string[];

  @IsOptional()
  @IsArray()
  systemsManaged?: string[];

  @IsOptional()
  @IsArray()
  technologyStack?: {
    category: string;
    tools: string[];
  }[];

  @IsOptional()
  @IsEnum(['Critical', 'High', 'Medium', 'Low'])
  riskLevel?: string;

  @IsOptional()
  @IsArray()
  complianceRequirements?: string[];

  @IsOptional()
  @IsArray()
  regulatoryBodies?: string[];

  @IsOptional()
  @IsBoolean()
  auditRequired?: boolean;

  @IsOptional()
  @IsDateString()
  lastAuditDate?: string;

  @IsOptional()
  @IsDateString()
  nextAuditDate?: string;

  @IsOptional()
  @IsArray()
  geographicCoverage?: string[];

  @IsOptional()
  @IsEnum(['Global', 'Regional', 'National', 'Local'])
  locationScope?: string;

  @IsOptional()
  @IsArray()
  operatingRegions?: string[];

  @IsOptional()
  @IsString()
  areaHead?: string;

  @IsOptional()
  @IsString()
  areaHeadEmail?: string;

  @IsOptional()
  @IsString()
  functionalLead?: string;

  @IsOptional()
  @IsString()
  hrBusinessPartner?: string;

  @IsOptional()
  @IsArray()
  keyStakeholders?: string[];

  @IsOptional()
  @IsArray()
  slaTargets?: {
    metric: string;
    target: string;
    actual: string;
  }[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  customerSatisfactionScore?: number;

  @IsOptional()
  @IsNumber()
  avgResponseTime?: number;

  @IsOptional()
  @IsEnum(['High', 'Medium', 'Low'])
  automationPotential?: string;

  @IsOptional()
  @IsEnum(['Advanced', 'Moderate', 'Basic', 'Manual'])
  digitalizationStatus?: string;

  @IsOptional()
  @IsArray()
  transformationRoadmap?: {
    initiative: string;
    timeline: string;
    status: string;
  }[];

  @IsOptional()
  @IsArray()
  futureCapabilities?: string[];

  @IsOptional()
  @IsArray()
  dependentAreas?: string[];

  @IsOptional()
  @IsArray()
  supportedAreas?: string[];

  @IsOptional()
  @IsArray()
  crossFunctionalProjects?: {
    projectName: string;
    partners: string[];
    status: string;
  }[];

  @IsOptional()
  @IsNumber()
  costPerEmployee?: number;

  @IsOptional()
  @IsNumber()
  costPerOutput?: number;

  @IsOptional()
  @IsArray()
  costBreakdown?: {
    category: string;
    amount: number;
    percentage: number;
  }[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  qualityScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  errorRate?: number;

  @IsOptional()
  @IsNumber()
  defectCount?: number;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  customFields?: { [key: string]: any };

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isCritical?: boolean;

  @IsOptional()
  @IsBoolean()
  isStrategic?: boolean;

  @IsOptional()
  @IsDateString()
  establishedDate?: string;

  @IsOptional()
  @IsDateString()
  lastReviewDate?: string;

  @IsOptional()
  @IsDateString()
  nextReviewDate?: string;
}

export class UpdateFunctionalAreaDto {
  @IsOptional()
  @IsString()
  areaCode?: string;

  @IsOptional()
  @IsString()
  areaName?: string;

  @IsOptional()
  @IsString()
  areaDescription?: string;

  @IsOptional()
  @IsString()
  groupCompanyId?: string;

  @IsOptional()
  @IsString()
  parentAreaId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  areaLevel?: number;

  @IsOptional()
  @IsEnum(['Primary', 'Support', 'Strategic', 'Operational', 'Administrative'])
  areaType?: string;

  @IsOptional()
  @IsString()
  businessFunction?: string;

  @IsOptional()
  @IsBoolean()
  isCore?: boolean;

  @IsOptional()
  @IsBoolean()
  isRevenue?: boolean;

  @IsOptional()
  @IsBoolean()
  isSupport?: boolean;

  @IsOptional()
  @IsEnum(['Critical', 'High', 'Medium', 'Low'])
  strategicImportance?: string;

  @IsOptional()
  @IsEnum(['Direct', 'Indirect', 'Support'])
  businessImpact?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  priorityLevel?: number;

  @IsOptional()
  @IsNumber()
  headcountCurrent?: number;

  @IsOptional()
  @IsNumber()
  headcountBudgeted?: number;

  @IsOptional()
  @IsNumber()
  annualBudget?: number;

  @IsOptional()
  @IsString()
  budgetCurrency?: string;

  @IsOptional()
  @IsNumber()
  actualSpend?: number;

  @IsOptional()
  @IsArray()
  kpiMetrics?: string[];

  @IsOptional()
  @IsArray()
  performanceTargets?: {
    metric: string;
    target: number;
    actual: number;
    unit: string;
  }[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  efficiencyScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  productivityScore?: number;

  @IsOptional()
  @IsArray()
  coreCapabilities?: string[];

  @IsOptional()
  @IsArray()
  requiredSkills?: string[];

  @IsOptional()
  @IsArray()
  certifications?: string[];

  @IsOptional()
  @IsArray()
  toolsUsed?: string[];

  @IsOptional()
  @IsArray()
  systemsManaged?: string[];

  @IsOptional()
  @IsArray()
  technologyStack?: {
    category: string;
    tools: string[];
  }[];

  @IsOptional()
  @IsEnum(['Critical', 'High', 'Medium', 'Low'])
  riskLevel?: string;

  @IsOptional()
  @IsArray()
  complianceRequirements?: string[];

  @IsOptional()
  @IsArray()
  regulatoryBodies?: string[];

  @IsOptional()
  @IsBoolean()
  auditRequired?: boolean;

  @IsOptional()
  @IsDateString()
  lastAuditDate?: string;

  @IsOptional()
  @IsDateString()
  nextAuditDate?: string;

  @IsOptional()
  @IsArray()
  geographicCoverage?: string[];

  @IsOptional()
  @IsEnum(['Global', 'Regional', 'National', 'Local'])
  locationScope?: string;

  @IsOptional()
  @IsArray()
  operatingRegions?: string[];

  @IsOptional()
  @IsString()
  areaHead?: string;

  @IsOptional()
  @IsString()
  areaHeadEmail?: string;

  @IsOptional()
  @IsString()
  functionalLead?: string;

  @IsOptional()
  @IsString()
  hrBusinessPartner?: string;

  @IsOptional()
  @IsArray()
  keyStakeholders?: string[];

  @IsOptional()
  @IsArray()
  slaTargets?: {
    metric: string;
    target: string;
    actual: string;
  }[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  customerSatisfactionScore?: number;

  @IsOptional()
  @IsNumber()
  avgResponseTime?: number;

  @IsOptional()
  @IsEnum(['High', 'Medium', 'Low'])
  automationPotential?: string;

  @IsOptional()
  @IsEnum(['Advanced', 'Moderate', 'Basic', 'Manual'])
  digitalizationStatus?: string;

  @IsOptional()
  @IsArray()
  transformationRoadmap?: {
    initiative: string;
    timeline: string;
    status: string;
  }[];

  @IsOptional()
  @IsArray()
  futureCapabilities?: string[];

  @IsOptional()
  @IsArray()
  dependentAreas?: string[];

  @IsOptional()
  @IsArray()
  supportedAreas?: string[];

  @IsOptional()
  @IsArray()
  crossFunctionalProjects?: {
    projectName: string;
    partners: string[];
    status: string;
  }[];

  @IsOptional()
  @IsNumber()
  costPerEmployee?: number;

  @IsOptional()
  @IsNumber()
  costPerOutput?: number;

  @IsOptional()
  @IsArray()
  costBreakdown?: {
    category: string;
    amount: number;
    percentage: number;
  }[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  qualityScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  errorRate?: number;

  @IsOptional()
  @IsNumber()
  defectCount?: number;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  customFields?: { [key: string]: any };

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isCritical?: boolean;

  @IsOptional()
  @IsBoolean()
  isStrategic?: boolean;

  @IsOptional()
  @IsDateString()
  establishedDate?: string;

  @IsOptional()
  @IsDateString()
  lastReviewDate?: string;

  @IsOptional()
  @IsDateString()
  nextReviewDate?: string;
}
