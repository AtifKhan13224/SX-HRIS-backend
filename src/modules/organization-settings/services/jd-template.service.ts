import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JDTemplate } from '../entities/jd-template.entity';
import { CreateJDTemplateDto, UpdateJDTemplateDto } from '../dto/jd-template.dto';

@Injectable()
export class JDTemplateService {
  constructor(
    @InjectRepository(JDTemplate)
    private templateRepository: Repository<JDTemplate>,
  ) {}

  async create(createDto: CreateJDTemplateDto): Promise<JDTemplate> {
    const existing = await this.templateRepository.findOne({
      where: { templateCode: createDto.templateCode },
    });

    if (existing) {
      throw new BadRequestException(`Template with code ${createDto.templateCode} already exists`);
    }

    const template = this.templateRepository.create(createDto);
    return await this.templateRepository.save(template);
  }

  async findAll(groupCompanyId?: string, search?: string, category?: string): Promise<JDTemplate[]> {
    const queryBuilder = this.templateRepository.createQueryBuilder('template')
      .leftJoinAndSelect('template.groupCompany', 'groupCompany')
      .leftJoinAndSelect('template.designationName', 'designationName');

    if (groupCompanyId) {
      queryBuilder.andWhere('template.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(template.templateName ILIKE :search OR template.templateCode ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (category) {
      queryBuilder.andWhere('template.category = :category', { category });
    }

    return await queryBuilder.orderBy('template.sortOrder', 'ASC').getMany();
  }

  async findOne(id: string): Promise<JDTemplate> {
    const template = await this.templateRepository.findOne({
      where: { id },
      relations: ['groupCompany', 'designationName'],
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return template;
  }

  async update(id: string, updateDto: UpdateJDTemplateDto): Promise<JDTemplate> {
    const template = await this.findOne(id);
    Object.assign(template, updateDto);
    return await this.templateRepository.save(template);
  }

  async remove(id: string): Promise<void> {
    const template = await this.findOne(id);
    await this.templateRepository.remove(template);
  }

  async getStats(groupCompanyId?: string): Promise<any> {
    const templates = await this.findAll(groupCompanyId);

    return {
      totalTemplates: templates.length,
      activeTemplates: templates.filter(t => t.isActive).length,
      publishedTemplates: templates.filter(t => t.isPublished).length,
      standardTemplates: templates.filter(t => t.isStandard).length,
      totalUsage: templates.reduce((sum, t) => sum + (t.usageCount || 0), 0),
      avgRating: templates.reduce((sum, t) => sum + (t.averageRating || 0), 0) / (templates.length || 1),
      byCategory: templates.reduce((acc, t) => {
        const cat = t.category || 'Uncategorized';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {}),
    };
  }

  async getUsageAnalytics(groupCompanyId?: string): Promise<any> {
    const templates = await this.findAll(groupCompanyId);

    return templates.map(t => ({
      id: t.id,
      code: t.templateCode,
      name: t.templateName,
      usageCount: t.usageCount,
      activeUsage: t.activeUsageCount,
      lastUsed: t.lastUsedDate,
      rating: t.averageRating,
      totalRatings: t.totalRatings,
    }));
  }

  async cloneTemplate(id: string, newCode: string, newName: string): Promise<JDTemplate> {
    const source = await this.findOne(id);
    
    // Extract properties to clone, excluding auto-generated fields
    const cloneData: Partial<JDTemplate> = {
      groupCompanyId: source.groupCompanyId,
      designationNameId: source.designationNameId,
      templateName: newName,
      description: source.description,
      category: source.category,
      templateType: source.templateType,
      version: source.version,
      jobTitle: source.jobTitle,
      jobSummary: source.jobSummary,
      jobOverview: source.jobOverview,
      keyResponsibilities: source.keyResponsibilities,
      responsibilities: source.responsibilities,
      qualifications: source.qualifications,
      educationRequirements: source.educationRequirements,
      experienceRequirements: source.experienceRequirements,
      requiredSkills: source.requiredSkills,
      preferredSkills: source.preferredSkills,
      certifications: source.certifications,
      workingConditions: source.workingConditions,
      physicalRequirements: source.physicalRequirements,
      travelRequirements: source.travelRequirements,
      benefitsPackage: source.benefitsPackage,
      compensationRange: source.compensationRange,
      careerPath: source.careerPath,
      companyOverview: source.companyOverview,
      equalOpportunityStatement: source.equalOpportunityStatement,
      sections: source.sections,
      layout: source.layout,
      includedSections: source.includedSections,
      optionalSections: source.optionalSections,
      styling: source.styling,
      brandingElements: source.brandingElements,
      headerTemplate: source.headerTemplate,
      footerTemplate: source.footerTemplate,
      logoUrl: source.logoUrl,
      parentTemplateId: source.id,
      isCustomizable: source.isCustomizable,
      requiresApproval: source.requiresApproval,
      tags: source.tags,
      customFields: source.customFields,
      metadata: source.metadata,
    };

    const clone = this.templateRepository.create({
      ...cloneData,
      templateCode: newCode,
      isActive: false,
      isPublished: false,
      isApproved: false,
      usageCount: 0,
      activeUsageCount: 0,
    });

    return await this.templateRepository.save(clone);
  }

  async bulkUpdate(updates: Array<{ id: string; data: UpdateJDTemplateDto }>): Promise<JDTemplate[]> {
    const results: JDTemplate[] = [];

    for (const update of updates) {
      const updated = await this.update(update.id, update.data);
      results.push(updated);
    }

    return results;
  }
}
