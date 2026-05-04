import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DesignationTitle } from '../entities/designation-title.entity';
import { CreateDesignationTitleDto, UpdateDesignationTitleDto } from '../dto/designation-title.dto';

@Injectable()
export class DesignationTitleService {
  constructor(
    @InjectRepository(DesignationTitle)
    private titleRepository: Repository<DesignationTitle>,
  ) {}

  async create(createDto: CreateDesignationTitleDto): Promise<DesignationTitle> {
    const existing = await this.titleRepository.findOne({
      where: { titleCode: createDto.titleCode },
    });

    if (existing) {
      throw new BadRequestException(`Title with code ${createDto.titleCode} already exists`);
    }

    const title = this.titleRepository.create(createDto);
    return await this.titleRepository.save(title);
  }

  async findAll(groupCompanyId?: string, search?: string, languageCode?: string): Promise<DesignationTitle[]> {
    const queryBuilder = this.titleRepository.createQueryBuilder('title')
      .leftJoinAndSelect('title.groupCompany', 'groupCompany')
      .leftJoinAndSelect('title.designationName', 'designationName');

    if (groupCompanyId) {
      queryBuilder.andWhere('title.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(title.titleName ILIKE :search OR title.titleCode ILIKE :search OR title.shortTitle ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (languageCode) {
      queryBuilder.andWhere('title.languageCode = :languageCode', { languageCode });
    }

    return await queryBuilder
      .orderBy('title.isPrimary', 'DESC')
      .addOrderBy('title.sortOrder', 'ASC')
      .getMany();
  }

  async findOne(id: string): Promise<DesignationTitle> {
    const title = await this.titleRepository.findOne({
      where: { id },
      relations: ['groupCompany', 'designationName'],
    });

    if (!title) {
      throw new NotFoundException(`Title with ID ${id} not found`);
    }

    return title;
  }

  async update(id: string, updateDto: UpdateDesignationTitleDto): Promise<DesignationTitle> {
    const title = await this.findOne(id);

    if (updateDto.titleCode && updateDto.titleCode !== title.titleCode) {
      const existing = await this.titleRepository.findOne({
        where: { titleCode: updateDto.titleCode },
      });

      if (existing) {
        throw new BadRequestException(`Title with code ${updateDto.titleCode} already exists`);
      }
    }

    Object.assign(title, updateDto);
    return await this.titleRepository.save(title);
  }

  async remove(id: string): Promise<void> {
    const title = await this.findOne(id);
    await this.titleRepository.remove(title);
  }

  async getStats(groupCompanyId?: string): Promise<any> {
    const queryBuilder = this.titleRepository.createQueryBuilder('title');

    if (groupCompanyId) {
      queryBuilder.where('title.groupCompanyId = :groupCompanyId', { groupCompanyId });
    }

    const titles = await queryBuilder.getMany();

    const totalTitles = titles.length;
    const activeTitles = titles.filter(t => t.isActive).length;
    const primaryTitles = titles.filter(t => t.isPrimary).length;
    const deprecatedTitles = titles.filter(t => t.isDeprecated).length;

    const byType = titles.reduce((acc, t) => {
      const type = t.titleType || 'Unclassified';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const byLanguage = titles.reduce((acc, t) => {
      const lang = t.languageCode || 'Unknown';
      acc[lang] = (acc[lang] || 0) + 1;
      return acc;
    }, {});

    const byContext = titles.reduce((acc, t) => {
      const context = t.titleContext || 'Unspecified';
      acc[context] = (acc[context] || 0) + 1;
      return acc;
    }, {});

    const totalUsage = titles.reduce((sum, t) => sum + (t.usageCount || 0), 0);
    const activeUsage = titles.reduce((sum, t) => sum + (t.activeUsageCount || 0), 0);

    return {
      totalTitles,
      activeTitles,
      primaryTitles,
      deprecatedTitles,
      byType,
      byLanguage,
      byContext,
      totalUsage,
      activeUsage,
      internalTitles: titles.filter(t => t.isInternal).length,
      externalTitles: titles.filter(t => t.isExternal).length,
      legalTitles: titles.filter(t => t.isLegal).length,
      marketingTitles: titles.filter(t => t.isMarketing).length,
    };
  }

  async getLocalizationMap(groupCompanyId?: string): Promise<any> {
    const titles = await this.findAll(groupCompanyId);

    const byLanguage = titles.reduce((acc, t) => {
      const lang = t.languageCode || 'en';
      if (!acc[lang]) {
        acc[lang] = [];
      }
      acc[lang].push({
        id: t.id,
        code: t.titleCode,
        title: t.titleName,
        locale: t.locale,
        isPreferred: t.isPreferred,
      });
      return acc;
    }, {});

    return byLanguage;
  }

  async getTitleVariations(designationNameId: string): Promise<any> {
    const titles = await this.titleRepository.find({
      where: { designationNameId },
    });

    return {
      designationNameId,
      totalVariations: titles.length,
      variations: titles.map(t => ({
        id: t.id,
        code: t.titleCode,
        title: t.titleName,
        type: t.titleType,
        context: t.titleContext,
        isPrimary: t.isPrimary,
        language: t.languageCode,
        isActive: t.isActive,
      })),
    };
  }

  async getMarketIntelligence(groupCompanyId?: string): Promise<any> {
    const titles = await this.findAll(groupCompanyId);

    return titles.map(t => ({
      id: t.id,
      code: t.titleCode,
      title: t.titleName,
      market: {
        trend: t.marketTrend,
        adoptionRate: t.marketAdoptionRate,
        trendAnalysisDate: t.trendAnalysisDate,
        emergingAlternatives: t.emergingAlternatives || [],
      },
      usage: {
        count: t.usageCount,
        active: t.activeUsageCount,
        lastUsed: t.lastUsedDate,
        popularity: t.popularityScore,
        preference: t.preferenceScore,
      },
      competitor: {
        equivalents: t.competitorEquivalents || [],
        industryEquivalents: t.industryEquivalents || [],
        commonVariations: t.commonVariations || [],
      },
    }));
  }

  async getGeographicCoverage(groupCompanyId?: string): Promise<any> {
    const titles = await this.findAll(groupCompanyId);

    return titles.map(t => ({
      id: t.id,
      code: t.titleCode,
      title: t.titleName,
      geography: {
        region: t.region,
        country: t.country,
        state: t.state,
        applicableRegions: t.applicableRegions || [],
        applicableCountries: t.applicableCountries || [],
        scope: t.geographicScope,
      },
    }));
  }

  async getSEOAnalysis(groupCompanyId?: string): Promise<any> {
    const titles = await this.findAll(groupCompanyId);

    return titles.map(t => ({
      id: t.id,
      code: t.titleCode,
      title: t.titleName,
      seo: {
        metaTitle: t.metaTitle,
        metaDescription: t.metaDescription,
        keywords: t.keywords || [],
        searchTerms: t.searchTerms || [],
        searchKeywords: t.searchKeywords || [],
        metadata: t.seoMetadata,
      },
      characteristics: {
        characterCount: t.characterCount,
        wordCount: t.wordCount,
        hasSpecialCharacters: t.hasSpecialCharacters,
        hasNumbers: t.hasNumbers,
        isAllCaps: t.isAllCaps,
        isTitleCase: t.isTitleCase,
      },
    }));
  }

  async getUsageContexts(groupCompanyId?: string): Promise<any> {
    const titles = await this.findAll(groupCompanyId);

    const contextMap = titles.reduce((acc, t) => {
      const contexts = t.usageContexts || ['General'];
      contexts.forEach(context => {
        if (!acc[context]) {
          acc[context] = [];
        }
        acc[context].push({
          id: t.id,
          code: t.titleCode,
          title: t.titleName,
          isPrimary: t.isPrimary,
        });
      });
      return acc;
    }, {});

    return contextMap;
  }

  async getComplianceReport(groupCompanyId?: string): Promise<any> {
    const titles = await this.findAll(groupCompanyId);

    return titles.map(t => ({
      id: t.id,
      code: t.titleCode,
      title: t.titleName,
      compliance: {
        legalRequirements: t.legalRequirements || [],
        complianceNotes: t.complianceNotes || [],
        regulatoryConsiderations: t.regulatoryConsiderations || [],
        requiresLegalApproval: t.requiresLegalApproval,
        isProtectedTitle: t.isProtectedTitle,
      },
      approval: {
        status: t.approvalStatus,
        approvedBy: t.approvedBy,
        approvedDate: t.approvedDate,
        comments: t.approvalComments,
      },
    }));
  }

  async getVersionHistory(titleCode: string): Promise<any> {
    const titles = await this.titleRepository.find({
      where: { titleCode },
      order: { createdAt: 'DESC' },
    });

    if (titles.length === 0) {
      throw new NotFoundException(`No titles found with code ${titleCode}`);
    }

    return {
      titleCode,
      totalVersions: titles.length,
      current: titles[0],
      history: titles.map(t => ({
        id: t.id,
        version: t.versionHistory,
        effectiveDate: t.effectiveDate,
        expiryDate: t.expiryDate,
        changeReason: t.changeReason,
        createdAt: t.createdAt,
      })),
    };
  }

  async bulkUpdate(updates: Array<{ id: string; data: UpdateDesignationTitleDto }>): Promise<DesignationTitle[]> {
    const results: DesignationTitle[] = [];

    for (const update of updates) {
      const updated = await this.update(update.id, update.data);
      results.push(updated);
    }

    return results;
  }
}
