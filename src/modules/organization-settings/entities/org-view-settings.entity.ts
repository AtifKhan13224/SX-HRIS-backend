import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('org_view_settings')
export class OrgViewSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  tenantId: string;

  // Core Configuration
  @Column({ type: 'jsonb', nullable: true })
  coreConfig: {
    defaultView: string;
    enableHierarchy: boolean;
    showVacantPositions: boolean;
    displayOptions: {
      showPhotos: boolean;
      showEmails: boolean;
      showPhones: boolean;
      compactView: boolean;
    };
  };

  // Visibility Rules
  @Column({ type: 'jsonb', nullable: true })
  visibilityRules: Array<{
    id: string;
    name: string;
    role: string;
    scope: string;
    restrictions: string[];
  }>;

  // Hierarchy Configuration
  @Column({ type: 'jsonb', nullable: true })
  hierarchyConfig: {
    maxLevels: number;
    autoExpand: boolean;
    showLevelBadges: boolean;
    enableDragDrop: boolean;
    levels: Array<{
      id: string;
      level: number;
      name: string;
      icon: string;
      color: string;
      minReports: number;
      maxReports: number;
    }>;
  };

  // Search Engine Configuration
  @Column({ type: 'jsonb', nullable: true })
  searchConfig: {
    selectedEngine: string;
    elasticsearch: {
      clusterEndpoint: string;
      indexName: string;
      refreshInterval: string;
      fuzzyMatching: boolean;
      autoComplete: boolean;
      resultHighlighting: boolean;
      stemming: boolean;
      phoneticMatching: boolean;
      synonymExpansion: boolean;
    };
    behavior: {
      minQueryLength: number;
      maxResultsPerPage: number;
      searchTimeout: number;
      fuzzyDistance: string;
    };
  };

  // Filter Templates
  @Column({ type: 'jsonb', nullable: true })
  filterTemplates: Array<{
    id: string;
    name: string;
    active: boolean;
  }>;

  // Custom Filter Groups
  @Column({ type: 'jsonb', nullable: true })
  filterGroups: Array<{
    id: string;
    logic: string;
    conditions: Array<{
      id: string;
      field: string;
      operator: string;
      value: string;
    }>;
  }>;

  // Searchable Fields
  @Column({ type: 'jsonb', nullable: true })
  searchableFields: {
    primary: Array<{
      id: string;
      field: string;
      weight: number;
      boost: boolean;
      fuzzy: boolean;
      enabled: boolean;
    }>;
    secondary: Array<{
      id: string;
      field: string;
      weight: number;
      enabled: boolean;
    }>;
    advanced: {
      operators: {
        wildcard: boolean;
        phraseSearch: boolean;
        booleanOperators: boolean;
        rangeQueries: boolean;
      };
      enhancements: {
        autoSuggestions: boolean;
        spellChecking: boolean;
        searchHistory: boolean;
        recentSearches: boolean;
      };
      ranking: {
        relevanceScoring: boolean;
        fieldWeightBoosting: boolean;
        personalizedResults: boolean;
        recentActivityBoost: boolean;
      };
    };
  };

  // Performance Configuration
  @Column({ type: 'jsonb', nullable: true })
  performanceConfig: {
    queryOptimization: string;
    indexRefreshRate: string;
    enableCaching: boolean;
    compressResults: boolean;
    parallelExecution: boolean;
  };

  // Caching Configuration
  @Column({ type: 'jsonb', nullable: true })
  cachingConfig: {
    cacheSize: number;
    cacheTTL: number;
    cachePopularQueries: boolean;
    preWarmCache: boolean;
    distributedCache: boolean;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;
}
