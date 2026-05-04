import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like, Not, IsNull } from 'typeorm';
import {
  Picklist,
  PicklistValue,
  PicklistDependency,
  PicklistVersion,
  PicklistUsageLog,
  PicklistAuditLog,
} from './entities/picklist.entity';
import {
  CreatePicklistDto,
  UpdatePicklistDto,
  CreatePicklistValueDto,
  UpdatePicklistValueDto,
  PicklistFilterDto,
  CreatePicklistDependencyDto,
  CreatePicklistVersionDto,
  BulkPicklistOperationDto,
  ReorderPicklistValuesDto,
  ExportPicklistDto,
  ImportPicklistDto,
  PicklistAnalyticsQueryDto,
  ValidatePicklistDto,
  ValidatePicklistValuesDto,
} from './dto/picklist.dto';

@Injectable()
export class PicklistService {
  private readonly logger = new Logger(PicklistService.name);

  constructor(
    @InjectRepository(Picklist)
    private picklistRepository: Repository<Picklist>,
    @InjectRepository(PicklistValue)
    private picklistValueRepository: Repository<PicklistValue>,
    @InjectRepository(PicklistDependency)
    private picklistDependencyRepository: Repository<PicklistDependency>,
    @InjectRepository(PicklistVersion)
    private picklistVersionRepository: Repository<PicklistVersion>,
    @InjectRepository(PicklistUsageLog)
    private picklistUsageLogRepository: Repository<PicklistUsageLog>,
    @InjectRepository(PicklistAuditLog)
    private picklistAuditLogRepository: Repository<PicklistAuditLog>,
  ) {}

  // ==================== PICKLIST CRUD ====================

  async findAll(filter: PicklistFilterDto): Promise<any> {
    const {
      search,
      type,
      status,
      isHierarchical,
      hasParent,
      page = 1,
      limit = 50,
      sortBy = 'displayLabel',
      sortOrder = 'ASC',
    } = filter;

    const query = this.picklistRepository.createQueryBuilder('picklist');

    if (search) {
      query.andWhere(
        '(picklist.internalName ILIKE :search OR picklist.displayLabel ILIKE :search OR picklist.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (type) {
      query.andWhere('picklist.type = :type', { type });
    }

    if (status) {
      query.andWhere('picklist.status = :status', { status });
    }

    if (isHierarchical !== undefined) {
      query.andWhere('picklist.isHierarchical = :isHierarchical', { isHierarchical });
    }

    query
      .leftJoinAndSelect('picklist.values', 'values')
      .leftJoinAndSelect('picklist.dependencies', 'dependencies')
      .orderBy(`picklist.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [picklists, total] = await query.getManyAndCount();

    return {
      data: picklists,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Picklist> {
    const picklist = await this.picklistRepository.findOne({
      where: { id },
      relations: ['values', 'dependencies', 'versions'],
    });

    if (!picklist) {
      throw new NotFoundException(`Picklist with ID ${id} not found`);
    }

    return picklist;
  }

  async findByName(name: string): Promise<Picklist> {
    const picklist = await this.picklistRepository.findOne({
      where: { internalName: name },
      relations: ['values', 'dependencies'],
    });

    if (!picklist) {
      throw new NotFoundException(`Picklist with name ${name} not found`);
    }

    return picklist;
  }

  async create(createDto: CreatePicklistDto, userId: string): Promise<Picklist> {
    // Check if picklist with same name exists
    const existing = await this.picklistRepository.findOne({
      where: { internalName: createDto.internalName },
    });

    if (existing) {
      throw new ConflictException(`Picklist with name ${createDto.internalName} already exists`);
    }

    const picklist = this.picklistRepository.create({
      ...createDto,
      createdBy: userId,
      updatedBy: userId,
      totalValues: createDto.values?.length || 0,
      activeValues: createDto.values?.filter(v => v.status === 'active').length || 0,
    });

    const saved = await this.picklistRepository.save(picklist);

    // Create values if provided
    if (createDto.values && createDto.values.length > 0) {
      await this.bulkCreateValues(saved.id, createDto.values, userId);
    }

    // Log audit
    await this.logAudit(saved.id, 'create', {}, saved, userId);

    this.logger.log(`Picklist created: ${saved.internalName} by ${userId}`);

    return this.findOne(saved.id);
  }

  async update(id: string, updateDto: UpdatePicklistDto, userId: string): Promise<Picklist> {
    const picklist = await this.findOne(id);

    // Prevent updating system picklists
    if (picklist.type === 'system') {
      throw new BadRequestException('System picklists cannot be modified');
    }

    const oldValues = { ...picklist };

    Object.assign(picklist, updateDto);
    picklist.updatedBy = userId;

    const updated = await this.picklistRepository.save(picklist);

    // Create version if versioning is enabled
    if (picklist.isVersioned && updateDto.changeDescription) {
      await this.createVersion({
        picklistName: picklist.internalName,
        changeDescription: updateDto.changeDescription,
      }, userId);
    }

    // Log audit
    await this.logAudit(id, 'update', oldValues, updated, userId);

    this.logger.log(`Picklist updated: ${picklist.internalName} by ${userId}`);

    return this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const picklist = await this.findOne(id);

    // Prevent deleting system picklists
    if (picklist.type === 'system') {
      throw new BadRequestException('System picklists cannot be deleted');
    }

    // Check if picklist is being used
    const usageCount = await this.picklistUsageLogRepository.count({
      where: { picklistId: id },
    });

    if (usageCount > 0) {
      throw new BadRequestException(
        `Picklist is in use (${usageCount} records). Consider deactivating instead of deleting.`,
      );
    }

    await this.logAudit(id, 'delete', picklist, {}, userId);
    await this.picklistRepository.remove(picklist);

    this.logger.log(`Picklist deleted: ${picklist.internalName} by ${userId}`);
  }

  // ==================== PICKLIST VALUE CRUD ====================

  async getValues(picklistId: string, parentValue?: string): Promise<PicklistValue[]> {
    const where: any = { picklistId };
    
    if (parentValue) {
      where.parentValue = parentValue;
    }

    return this.picklistValueRepository.find({
      where,
      order: { order: 'ASC', label: 'ASC' },
    });
  }

  async addValue(
    picklistId: string,
    createValueDto: CreatePicklistValueDto,
    userId: string,
  ): Promise<PicklistValue> {
    const picklist = await this.findOne(picklistId);

    // Check max values limit
    if (picklist.maxValues && picklist.totalValues >= picklist.maxValues) {
      throw new BadRequestException(`Maximum values limit (${picklist.maxValues}) reached`);
    }

    // Check duplicate value
    const existing = await this.picklistValueRepository.findOne({
      where: { picklistId, value: createValueDto.value },
    });

    if (existing) {
      throw new ConflictException(`Value ${createValueDto.value} already exists in this picklist`);
    }

    const value = this.picklistValueRepository.create({
      ...createValueDto,
      picklistId,
      createdBy: userId,
      updatedBy: userId,
    });

    const saved = await this.picklistValueRepository.save(value);

    // Update picklist counts
    await this.updatePicklistCounts(picklistId);

    this.logger.log(`Value added: ${saved.value} to ${picklist.internalName} by ${userId}`);

    return saved;
  }

  async updateValue(
    picklistId: string,
    valueId: string,
    updateValueDto: UpdatePicklistValueDto,
    userId: string,
  ): Promise<PicklistValue> {
    const value = await this.picklistValueRepository.findOne({
      where: { id: valueId, picklistId },
    });

    if (!value) {
      throw new NotFoundException(`Value with ID ${valueId} not found in this picklist`);
    }

    Object.assign(value, updateValueDto);
    value.updatedBy = userId;

    const updated = await this.picklistValueRepository.save(value);

    // Update picklist counts
    await this.updatePicklistCounts(picklistId);

    return updated;
  }

  async deleteValue(picklistId: string, valueId: string, userId: string): Promise<void> {
    const value = await this.picklistValueRepository.findOne({
      where: { id: valueId, picklistId },
    });

    if (!value) {
      throw new NotFoundException(`Value with ID ${valueId} not found`);
    }

    // Check if value is being used
    const usageCount = await this.picklistUsageLogRepository.count({
      where: { valueId },
    });

    if (usageCount > 0) {
      throw new BadRequestException(
        `Value is in use (${usageCount} records). Consider deactivating instead.`,
      );
    }

    await this.picklistValueRepository.remove(value);

    // Update picklist counts
    await this.updatePicklistCounts(picklistId);

    this.logger.log(`Value deleted: ${value.value} from picklist ${picklistId} by ${userId}`);
  }

  async bulkCreateValues(
    picklistId: string,
    values: CreatePicklistValueDto[],
    userId: string,
  ): Promise<PicklistValue[]> {
    const created = values.map((valueDto, index) => {
      return this.picklistValueRepository.create({
        ...valueDto,
        picklistId,
        order: valueDto.order !== undefined ? valueDto.order : index,
        createdBy: userId,
        updatedBy: userId,
      });
    });

    const saved = await this.picklistValueRepository.save(created);

    // Update picklist counts
    await this.updatePicklistCounts(picklistId);

    return saved;
  }

  async reorderValues(
    picklistId: string,
    reorderDto: ReorderPicklistValuesDto,
    userId: string,
  ): Promise<PicklistValue[]> {
    const { orderedValues } = reorderDto;

    // Fetch all values
    const values = await this.picklistValueRepository.find({
      where: { picklistId, value: In(orderedValues) },
    });

    // Update order
    const updates = values.map((value, index) => {
      value.order = orderedValues.indexOf(value.value);
      value.updatedBy = userId;
      return value;
    });

    return this.picklistValueRepository.save(updates);
  }

  // ==================== DEPENDENCIES ====================

  async getDependencies(picklistId: string): Promise<PicklistDependency[]> {
    return this.picklistDependencyRepository.find({
      where: [{ parentPicklistId: picklistId }, { childPicklistId: picklistId }],
      relations: ['parentPicklist', 'childPicklist'],
    });
  }

  async createDependency(
    createDto: CreatePicklistDependencyDto,
    userId: string,
  ): Promise<PicklistDependency> {
    const parent = await this.findByName(createDto.parentPicklistName);
    const child = await this.findByName(createDto.childPicklistName);

    // Check if dependency already exists
    const existing = await this.picklistDependencyRepository.findOne({
      where: {
        parentPicklistId: parent.id,
        childPicklistId: child.id,
      },
    });

    if (existing) {
      throw new ConflictException('Dependency already exists between these picklists');
    }

    const dependency = this.picklistDependencyRepository.create({
      parentPicklistId: parent.id,
      childPicklistId: child.id,
      dependencyType: createDto.dependencyType,
      mappings: createDto.mappings,
      options: createDto.options,
      createdBy: userId,
    });

    return this.picklistDependencyRepository.save(dependency);
  }

  async deleteDependency(dependencyId: string): Promise<void> {
    const dependency = await this.picklistDependencyRepository.findOne({
      where: { id: dependencyId },
    });

    if (!dependency) {
      throw new NotFoundException(`Dependency with ID ${dependencyId} not found`);
    }

    await this.picklistDependencyRepository.remove(dependency);
  }

  // ==================== VERSIONING ====================

  async createVersion(
    createDto: CreatePicklistVersionDto,
    userId: string,
  ): Promise<PicklistVersion> {
    const picklist = await this.findByName(createDto.picklistName);

    // Get current version number
    const lastVersion = await this.picklistVersionRepository.findOne({
      where: { picklistId: picklist.id },
      order: { createdAt: 'DESC' },
    });

    const versionNumber = createDto.version || this.incrementVersion(lastVersion?.version || '1.0.0');

    // Create snapshot
    const snapshot = {
      picklist: picklist,
      values: await this.getValues(picklist.id),
      dependencies: await this.getDependencies(picklist.id),
    };

    const version = this.picklistVersionRepository.create({
      picklistId: picklist.id,
      version: versionNumber,
      changeDescription: createDto.changeDescription,
      snapshot,
      createdBy: userId,
    });

    const saved = await this.picklistVersionRepository.save(version);

    await this.logAudit(picklist.id, 'version', {}, { version: versionNumber }, userId);

    return saved;
  }

  async getVersions(picklistId: string): Promise<PicklistVersion[]> {
    return this.picklistVersionRepository.find({
      where: { picklistId },
      order: { createdAt: 'DESC' },
    });
  }

  // ==================== ANALYTICS ====================

  async getAnalytics(query: PicklistAnalyticsQueryDto): Promise<any> {
    const picklist = await this.findByName(query.picklistName);

    const usageLogs = await this.picklistUsageLogRepository
      .createQueryBuilder('log')
      .where('log.picklistId = :picklistId', { picklistId: picklist.id })
      .andWhere('log.usedAt >= :startDate', { startDate: query.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) })
      .andWhere('log.usedAt <= :endDate', { endDate: query.endDate || new Date() })
      .getMany();

    const values = await this.getValues(picklist.id);

    // Calculate statistics
    const totalUsage = usageLogs.length;
    const valueUsage = values.map(v => ({
      value: v.value,
      label: v.label,
      usageCount: usageLogs.filter(log => log.valueId === v.id).length,
    })).sort((a, b) => b.usageCount - a.usageCount);

    const unusedValues = valueUsage.filter(v => v.usageCount === 0);
    const popularValues = valueUsage.slice(0, 10);

    return {
      picklist: {
        id: picklist.id,
        name: picklist.internalName,
        label: picklist.displayLabel,
        totalValues: picklist.totalValues,
        activeValues: picklist.activeValues,
      },
      usage: {
        totalUsage,
        averageUsagePerValue: totalUsage / values.length || 0,
        unusedValuesCount: unusedValues.length,
      },
      popularValues,
      unusedValues,
      usageTimeline: this.aggregateUsageByTime(usageLogs, query.granularity || 'daily'),
    };
  }

  // ==================== EXPORT/IMPORT ====================

  async exportPicklist(exportDto: ExportPicklistDto): Promise<any> {
    const picklist = await this.findByName(exportDto.picklistName);
    const values = await this.getValues(picklist.id);

    const data: any = {
      picklist: {
        internalName: picklist.internalName,
        displayLabel: picklist.displayLabel,
        description: picklist.description,
        type: picklist.type,
        status: picklist.status,
        isHierarchical: picklist.isHierarchical,
        allowMultiSelect: picklist.allowMultiSelect,
      },
    };

    if (exportDto.includeValues) {
      data.values = values.map(v => ({
        value: v.value,
        label: v.label,
        description: v.description,
        parentValue: v.parentValue,
        order: v.order,
        status: v.status,
        metadata: v.metadata,
      }));
    }

    if (exportDto.includeMetadata) {
      data.metadata = picklist.metadata;
      data.permissions = {
        edit: picklist.editPermissions,
        view: picklist.viewPermissions,
      };
    }

    if (exportDto.includeHistory) {
      data.versions = await this.getVersions(picklist.id);
    }

    if (exportDto.format === 'csv') {
      return this.convertToCSV(values);
    }

    return data;
  }

  async importPicklist(importDto: ImportPicklistDto, userId: string): Promise<Picklist> {
    const { data, overwriteExisting, validateBeforeImport } = importDto;

    if (validateBeforeImport) {
      this.validateImportData(data);
    }

    let picklist = await this.picklistRepository.findOne({
      where: { internalName: data.picklist.internalName },
    });

    if (picklist && !overwriteExisting) {
      throw new ConflictException(`Picklist ${data.picklist.internalName} already exists`);
    }

    if (picklist && overwriteExisting) {
      // Update existing
      await this.update(picklist.id, data.picklist, userId);
    } else {
      // Create new
      picklist = await this.create(data.picklist, userId);
    }

    // Import values
    if (data.values && data.values.length > 0) {
      await this.bulkCreateValues(picklist.id, data.values, userId);
    }

    await this.logAudit(picklist.id, 'import', {}, data, userId);

    return this.findOne(picklist.id);
  }

  // ==================== BULK OPERATIONS ====================

  async bulkOperation(operationDto: BulkPicklistOperationDto, userId: string): Promise<any> {
    const { operation, picklistNames, options } = operationDto;

    const picklists = await this.picklistRepository.find({
      where: { internalName: In(picklistNames) },
    });

    if (picklists.length !== picklistNames.length) {
      throw new BadRequestException('Some picklists not found');
    }

    const results = [];

    for (const picklist of picklists) {
      try {
        switch (operation) {
          case 'activate':
            await this.update(picklist.id, { status: 'active' } as any, userId);
            results.push({ name: picklist.internalName, status: 'success' });
            break;

          case 'deactivate':
            await this.update(picklist.id, { status: 'inactive' } as any, userId);
            results.push({ name: picklist.internalName, status: 'success' });
            break;

          case 'delete':
            await this.remove(picklist.id, userId);
            results.push({ name: picklist.internalName, status: 'success' });
            break;

          case 'export':
            const exported = await this.exportPicklist({
              picklistName: picklist.internalName,
              format: options?.format || 'json',
              includeValues: true,
            } as any);
            results.push({ name: picklist.internalName, status: 'success', data: exported });
            break;

          default:
            results.push({ name: picklist.internalName, status: 'error', message: 'Unknown operation' });
        }
      } catch (error) {
        results.push({ name: picklist.internalName, status: 'error', message: error.message });
      }
    }

    return { results, total: picklistNames.length, successful: results.filter(r => r.status === 'success').length };
  }

  // ==================== VALIDATION ====================

  async validateValue(validateDto: ValidatePicklistDto): Promise<any> {
    const picklist = await this.findByName(validateDto.picklistName);
    
    const value = await this.picklistValueRepository.findOne({
      where: {
        picklistId: picklist.id,
        value: validateDto.value,
      },
    });

    if (!value) {
      return { valid: false, message: `Value ${validateDto.value} not found in picklist ${validateDto.picklistName}` };
    }

    if (value.status !== 'active') {
      return { valid: false, message: `Value ${validateDto.value} is not active` };
    }

    // Check effective dates
    const now = new Date();
    if (value.effectiveStartDate && new Date(value.effectiveStartDate) > now) {
      return { valid: false, message: `Value ${validateDto.value} is not yet effective` };
    }
    if (value.effectiveEndDate && new Date(value.effectiveEndDate) < now) {
      return { valid: false, message: `Value ${validateDto.value} has expired` };
    }

    return { valid: true, value };
  }

  async validateValues(validateDto: ValidatePicklistValuesDto): Promise<any> {
    const picklist = await this.findByName(validateDto.picklistName);
    const values = await this.picklistValueRepository.find({
      where: {
        picklistId: picklist.id,
        value: In(validateDto.values),
      },
    });

    const validValues = values.filter(v => v.status === 'active').map(v => v.value);
    const invalidValues = validateDto.values.filter(v => !validValues.includes(v));

    return {
      valid: invalidValues.length === 0,
      validValues,
      invalidValues,
    };
  }

  // ==================== STANDARD PICKLISTS ====================

  async initializeStandardPicklists(userId: string): Promise<any> {
    const standardPicklists = [
      {
        internalName: 'country',
        displayLabel: 'Country',
        description: 'List of countries',
        type: 'standard',
        isSearchable: true,
        values: [
          { value: 'US', label: 'United States', metadata: { icon: '🇺🇸', code: 'US' } },
          { value: 'UK', label: 'United Kingdom', metadata: { icon: '🇬🇧', code: 'GB' } },
          { value: 'CA', label: 'Canada', metadata: { icon: '🇨🇦', code: 'CA' } },
          { value: 'AU', label: 'Australia', metadata: { icon: '🇦🇺', code: 'AU' } },
          { value: 'IN', label: 'India', metadata: { icon: '🇮🇳', code: 'IN' } },
        ],
      },
      {
        internalName: 'employment_type',
        displayLabel: 'Employment Type',
        description: 'Types of employment',
        type: 'standard',
        values: [
          { value: 'full_time', label: 'Full Time' },
          { value: 'part_time', label: 'Part Time' },
          { value: 'contract', label: 'Contract' },
          { value: 'intern', label: 'Intern' },
          { value: 'consultant', label: 'Consultant' },
        ],
      },
    ];

    const results = [];

    for (const picklistData of standardPicklists) {
      try {
        const existing = await this.picklistRepository.findOne({
          where: { internalName: picklistData.internalName },
        });

        if (!existing) {
          const created = await this.create(picklistData as any, userId);
          results.push({ name: picklistData.internalName, status: 'created', id: created.id });
        } else {
          results.push({ name: picklistData.internalName, status: 'already_exists', id: existing.id });
        }
      } catch (error) {
        results.push({ name: picklistData.internalName, status: 'error', message: error.message });
      }
    }

    return { results };
  }

  // ==================== HELPER METHODS ====================

  private async updatePicklistCounts(picklistId: string): Promise<void> {
    const totalValues = await this.picklistValueRepository.count({ where: { picklistId } });
    const activeValues = await this.picklistValueRepository.count({
      where: { picklistId, status: 'active' },
    });

    await this.picklistRepository.update(picklistId, { totalValues, activeValues });
  }

  private async logAudit(
    picklistId: string,
    action: string,
    oldValues: any,
    newValues: any,
    userId: string,
  ): Promise<void> {
    const audit = this.picklistAuditLogRepository.create({
      picklistId,
      action,
      oldValues,
      newValues,
      performedBy: userId,
    });

    await this.picklistAuditLogRepository.save(audit);
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.').map(Number);
    parts[2] = (parts[2] || 0) + 1;
    return parts.join('.');
  }

  private aggregateUsageByTime(logs: PicklistUsageLog[], granularity: string): any[] {
    // Group logs by time period
    const grouped = new Map();
    
    logs.forEach(log => {
      const date = new Date(log.usedAt);
      let key: string;

      switch (granularity) {
        case 'daily':
          key = date.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      grouped.set(key, (grouped.get(key) || 0) + 1);
    });

    return Array.from(grouped.entries()).map(([date, count]) => ({ date, count }));
  }

  private convertToCSV(values: PicklistValue[]): string {
    const headers = ['Value', 'Label', 'Description', 'Parent Value', 'Order', 'Status'];
    const rows = values.map(v => [
      v.value,
      v.label,
      v.description || '',
      v.parentValue || '',
      v.order.toString(),
      v.status,
    ]);

    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  private validateImportData(data: any): void {
    if (!data.picklist || !data.picklist.internalName) {
      throw new BadRequestException('Invalid import data: missing picklist.internalName');
    }

    if (data.values && !Array.isArray(data.values)) {
      throw new BadRequestException('Invalid import data: values must be an array');
    }
  }

  async logUsage(picklistId: string, valueId: string, fieldName: string, userId: string): Promise<void> {
    const log = this.picklistUsageLogRepository.create({
      picklistId,
      valueId,
      fieldName,
      userId,
      actionType: 'select',
    });

    await this.picklistUsageLogRepository.save(log);

    // Update value usage count
    await this.picklistValueRepository.update(valueId, {
      usageCount: () => 'usageCount + 1',
      lastUsedAt: new Date(),
    });

    // Update picklist usage count
    await this.picklistRepository.update(picklistId, {
      usageCount: () => 'usageCount + 1',
    });
  }
}
