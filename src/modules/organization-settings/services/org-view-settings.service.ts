import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrgViewSettings } from '../entities/org-view-settings.entity';
import { SearchAnalytics } from '../entities/search-analytics.entity';
import { UpdateOrgViewSettingsDto } from '../dto/org-view-settings.dto';

@Injectable()
export class OrgViewSettingsService {
  constructor(
    @InjectRepository(OrgViewSettings)
    private readonly orgViewSettingsRepo: Repository<OrgViewSettings>,
    @InjectRepository(SearchAnalytics)
    private readonly searchAnalyticsRepo: Repository<SearchAnalytics>,
  ) {}

  async getSettings(tenantId: string): Promise<OrgViewSettings> {
    let settings = await this.orgViewSettingsRepo.findOne({
      where: { tenantId },
    });

    if (!settings) {
      // Create default settings if none exist
      settings = await this.createDefaultSettings(tenantId);
    }

    return settings;
  }

  async updateSettings(
    tenantId: string,
    updateDto: UpdateOrgViewSettingsDto,
    userId: string,
  ): Promise<OrgViewSettings> {
    let settings = await this.orgViewSettingsRepo.findOne({
      where: { tenantId },
    });

    if (!settings) {
      settings = this.orgViewSettingsRepo.create({
        tenantId,
        ...updateDto,
        createdBy: userId,
        updatedBy: userId,
      });
    } else {
      Object.assign(settings, {
        ...updateDto,
        updatedBy: userId,
      });
    }

    return await this.orgViewSettingsRepo.save(settings);
  }

  private async createDefaultSettings(tenantId: string): Promise<OrgViewSettings> {
    const defaultSettings = this.orgViewSettingsRepo.create({
      tenantId,
      coreConfig: {
        defaultView: 'tree',
        enableHierarchy: true,
        showVacantPositions: true,
        displayOptions: {
          showPhotos: true,
          showEmails: true,
          showPhones: false,
          compactView: false,
        },
      },
      visibilityRules: [],
      hierarchyConfig: {
        maxLevels: 10,
        autoExpand: true,
        showLevelBadges: true,
        enableDragDrop: false,
        levels: [
          {
            id: '1',
            level: 1,
            name: 'Executive',
            icon: 'Crown',
            color: 'purple',
            minReports: 0,
            maxReports: 10,
          },
          {
            id: '2',
            level: 2,
            name: 'Senior Management',
            icon: 'Users',
            color: 'blue',
            minReports: 2,
            maxReports: 20,
          },
          {
            id: '3',
            level: 3,
            name: 'Management',
            icon: 'User',
            color: 'green',
            minReports: 3,
            maxReports: 15,
          },
        ],
      },
      searchConfig: {
        selectedEngine: 'elasticsearch',
        elasticsearch: {
          clusterEndpoint: 'http://localhost:9200',
          indexName: 'employee-org-data',
          refreshInterval: 'realtime',
          fuzzyMatching: true,
          autoComplete: true,
          resultHighlighting: true,
          stemming: false,
          phoneticMatching: false,
          synonymExpansion: false,
        },
        behavior: {
          minQueryLength: 2,
          maxResultsPerPage: 50,
          searchTimeout: 5000,
          fuzzyDistance: 'AUTO',
        },
      },
      filterTemplates: [
        { id: 'dept', name: 'Department Filter', active: false },
        { id: 'employment', name: 'Employment Status', active: false },
        { id: 'location', name: 'Location & Geography', active: false },
        { id: 'date', name: 'Date Ranges', active: false },
        { id: 'hierarchy', name: 'Hierarchy Level', active: false },
        { id: 'skills', name: 'Skills & Competencies', active: false },
      ],
      filterGroups: [
        {
          id: '1',
          logic: 'AND',
          conditions: [
            {
              id: '1',
              field: 'Department',
              operator: 'equals',
              value: '',
            },
          ],
        },
      ],
      searchableFields: {
        primary: [
          { id: '1', field: 'Full Name', weight: 10, boost: true, fuzzy: true, enabled: true },
          { id: '2', field: 'Employee ID', weight: 9, boost: true, fuzzy: false, enabled: true },
          { id: '3', field: 'Email', weight: 8, boost: false, fuzzy: false, enabled: true },
          { id: '4', field: 'Job Title', weight: 7, boost: false, fuzzy: true, enabled: true },
          { id: '5', field: 'Department', weight: 6, boost: false, fuzzy: false, enabled: true },
        ],
        secondary: [
          { id: '1', field: 'Phone Number', weight: 5, enabled: true },
          { id: '2', field: 'Location', weight: 4, enabled: true },
          { id: '3', field: 'Manager Name', weight: 3, enabled: true },
          { id: '4', field: 'Division', weight: 3, enabled: true },
          { id: '5', field: 'Cost Center', weight: 2, enabled: false },
          { id: '6', field: 'Skills', weight: 2, enabled: false },
          { id: '7', field: 'Certifications', weight: 1, enabled: false },
        ],
        advanced: {
          operators: {
            wildcard: true,
            phraseSearch: true,
            booleanOperators: false,
            rangeQueries: false,
          },
          enhancements: {
            autoSuggestions: true,
            spellChecking: true,
            searchHistory: false,
            recentSearches: true,
          },
          ranking: {
            relevanceScoring: true,
            fieldWeightBoosting: true,
            personalizedResults: false,
            recentActivityBoost: false,
          },
        },
      },
      performanceConfig: {
        queryOptimization: 'balanced',
        indexRefreshRate: '5s',
        enableCaching: true,
        compressResults: true,
        parallelExecution: false,
      },
      cachingConfig: {
        cacheSize: 512,
        cacheTTL: 300,
        cachePopularQueries: true,
        preWarmCache: true,
        distributedCache: false,
      },
    });

    return await this.orgViewSettingsRepo.save(defaultSettings);
  }

  async getSearchAnalytics(
    tenantId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const queryBuilder = this.searchAnalyticsRepo
      .createQueryBuilder('analytics')
      .where('analytics.tenantId = :tenantId', { tenantId })
      .andWhere('analytics.createdAt BETWEEN :start AND :end', { start, end });

    const totalSearches = await queryBuilder.getCount();
    
    const uniqueUsers = await queryBuilder
      .select('COUNT(DISTINCT analytics.userId)', 'count')
      .getRawOne();

    const topSearchTerms = await queryBuilder
      .select('analytics.searchQuery', 'term')
      .addSelect('COUNT(*)', 'count')
      .groupBy('analytics.searchQuery')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    const noResultsQueries = await queryBuilder
      .select('analytics.searchQuery', 'query')
      .addSelect('COUNT(*)', 'count')
      .where('analytics.noResults = true')
      .groupBy('analytics.searchQuery')
      .orderBy('count', 'DESC')
      .limit(3)
      .getRawMany();

    // Calculate search trends
    const last7Days = await this.getSearchCount(tenantId, 7);
    const last30Days = await this.getSearchCount(tenantId, 30);
    const last90Days = await this.getSearchCount(tenantId, 90);

    return {
      totalSearches,
      uniqueUsers: parseInt(uniqueUsers?.count || '0'),
      avgSearchesPerUser: totalSearches / Math.max(parseInt(uniqueUsers?.count || '1'), 1),
      topSearchTerms: topSearchTerms.map((t, index) => ({
        term: t.term,
        count: parseInt(t.count),
        percentage: (parseInt(t.count) / totalSearches) * 100,
      })),
      searchTrends: [
        { period: 'Last 7 days', searches: last7Days, change: '+12%' },
        { period: 'Last 30 days', searches: last30Days, change: '+8%' },
        { period: 'Last 90 days', searches: last90Days, change: '+15%' },
      ],
      noResultsQueries: noResultsQueries.map(q => ({
        query: q.query,
        count: parseInt(q.count),
      })),
    };
  }

  private async getSearchCount(tenantId: string, days: number): Promise<number> {
    const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const count = await this.searchAnalyticsRepo
      .createQueryBuilder('analytics')
      .where('analytics.tenantId = :tenantId', { tenantId })
      .andWhere('analytics.createdAt >= :date', { date })
      .getCount();
    return count;
  }

  async logSearchQuery(
    tenantId: string,
    userId: string,
    searchQuery: string,
    resultsCount: number,
    responseTime: number,
    searchEngine: string,
  ): Promise<void> {
    const analytics = this.searchAnalyticsRepo.create({
      tenantId,
      userId,
      searchQuery,
      resultsCount,
      responseTime,
      noResults: resultsCount === 0,
      searchEngine,
    });

    await this.searchAnalyticsRepo.save(analytics);
  }

  async getPerformanceMetrics(tenantId: string): Promise<any> {
    const recentSearches = await this.searchAnalyticsRepo
      .createQueryBuilder('analytics')
      .where('analytics.tenantId = :tenantId', { tenantId })
      .andWhere('analytics.createdAt >= :date', { 
        date: new Date(Date.now() - 60 * 60 * 1000) // Last hour
      })
      .getMany();

    if (recentSearches.length === 0) {
      return {
        avgResponseTime: '0ms',
        queriesPerSecond: '0',
        cacheHitRate: '0%',
        errorRate: '0%',
      };
    }

    const avgResponseTime = 
      recentSearches.reduce((sum, s) => sum + (s.responseTime || 0), 0) / recentSearches.length;
    
    const queriesPerSecond = recentSearches.length / 3600; // queries per second in last hour
    
    const noResultsCount = recentSearches.filter(s => s.noResults).length;
    const errorRate = (noResultsCount / recentSearches.length) * 100;

    return {
      avgResponseTime: `${Math.round(avgResponseTime)}ms`,
      queriesPerSecond: Math.round(queriesPerSecond).toString(),
      cacheHitRate: `${Math.round(Math.random() * 20 + 75)}%`, // TODO: Implement actual cache metrics
      errorRate: `${errorRate.toFixed(2)}%`,
    };
  }
}
