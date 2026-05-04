import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, In } from 'typeorm';
import { 
  NewHireTemplate, 
  NewHireInstance, 
  InstanceTask,
  TaskApproval,
  InstanceDocument,
  AutomationLog,
  NotificationLog
} from '../entities';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  PublishTemplateDto,
  CreateInstanceDto,
  UpdateInstanceDto,
  CreateTaskDto,
  UpdateTaskDto,
  CreateApprovalDto,
  UpdateApprovalDto,
  CreateDocumentDto,
  UpdateDocumentDto,
  QueryTemplatesDto,
  QueryInstancesDto,
  AnalyticsQueryDto,
  BulkActionDto
} from '../dto';

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(NewHireTemplate)
    private templateRepository: Repository<NewHireTemplate>
  ) {}

  /**
   * Create new template
   */
  async create(createDto: CreateTemplateDto, userId: string): Promise<NewHireTemplate> {
    const template = this.templateRepository.create({
      ...createDto,
      author: userId,
      isActive: true,
      isPublished: false,
      publishingStatus: 'DRAFT',
      metadata: {
        createdBy: userId,
        version: { major: 1, minor: 0, patch: 0, versionString: '1.0.0' }
      }
    });

    return this.templateRepository.save(template);
  }

  /**
   * Find all templates with filters
   */
  async findAll(query: QueryTemplatesDto): Promise<{ templates: NewHireTemplate[]; total: number }> {
    const {
      search,
      templateType,
      isActive,
      isPublished,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortDir = 'DESC'
    } = query;

    const where: FindOptionsWhere<NewHireTemplate> = {};

    if (search) {
      where.name = Like(`%${search}%`);
    }
    if (templateType) {
      where.templateType = templateType;
    }
    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }
    if (typeof isPublished === 'boolean') {
      where.isPublished = isPublished;
    }

    const [templates, total] = await this.templateRepository.findAndCount({
      where,
      order: { [sortBy]: sortDir },
      skip: (page - 1) * limit,
      take: limit
    });

    return { templates, total };
  }

  /**
   * Find one template by ID
   */
  async findOne(id: string): Promise<NewHireTemplate> {
    const template = await this.templateRepository.findOne({ where: { id } });
    
    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }

    return template;
  }

  /**
   * Update template
   */
  async update(id: string, updateDto: UpdateTemplateDto, userId: string): Promise<NewHireTemplate> {
    const template = await this.findOne(id);

    // Prevent editing published templates
    if (template.isPublished && !updateDto.isActive) {
      throw new BadRequestException('Cannot modify published template. Create a new version instead.');
    }

    Object.assign(template, updateDto);
    template.metadata = {
      ...template.metadata,
      lastModifiedBy: userId,
      lastModified: new Date().toISOString()
    };

    return this.templateRepository.save(template);
  }

  /**
   * Publish template
   */
  async publish(id: string, publishDto: PublishTemplateDto, userId: string): Promise<NewHireTemplate> {
    const template = await this.findOne(id);

    template.isPublished = true;
    template.publishingStatus = 'PUBLISHED';
    template.publishedAt = new Date();
    template.metadata = {
      ...template.metadata,
      publishedBy: userId,
      publishedAt: new Date().toISOString(),
      publishNotes: publishDto.notes
    };

    return this.templateRepository.save(template);
  }

  /**
   * Delete template
   */
  async remove(id: string): Promise<void> {
    const template = await this.findOne(id);

    // Soft delete by deactivating
    template.isActive = false;
    template.publishingStatus = 'ARCHIVED';
    await this.templateRepository.save(template);
  }

  /**
   * Clone template
   */
  async clone(id: string, userId: string): Promise<NewHireTemplate> {
    const original = await this.findOne(id);

    const clone = this.templateRepository.create({
      ...original,
      id: undefined,
      name: `${original.name} (Copy)`,
      isPublished: false,
      publishingStatus: 'DRAFT',
      publishedAt: undefined,
      author: userId,
      metadata: {
        ...original.metadata,
        clonedFrom: original.id,
        clonedAt: new Date().toISOString(),
        clonedBy: userId
      }
    });

    return this.templateRepository.save(clone);
  }

  /**
   * Get template analytics
   */
  async getAnalytics(id: string): Promise<any> {
    const template = await this.findOne(id);

    // TODO: Implement analytics aggregation from instances
    return {
      templateId: id,
      templateName: template.name,
      totalUsageCount: template.usage?.totalUsageCount || 0,
      activeInstanceCount: template.usage?.activeInstanceCount || 0,
      completionRate: 0,
      averageCompletionTime: 0,
      completionTimeTrend: [],
      phaseMetrics: [],
      taskMetrics: [],
      documentMetrics: []
    };
  }
}

@Injectable()
export class InstanceService {
  constructor(
    @InjectRepository(NewHireInstance)
    private instanceRepository: Repository<NewHireInstance>,
    @InjectRepository(NewHireTemplate)
    private templateRepository: Repository<NewHireTemplate>,
    @InjectRepository(InstanceTask)
    private taskRepository: Repository<InstanceTask>
  ) {}

  /**
   * Create new onboarding instance
   */
  async create(createDto: CreateInstanceDto, userId: string): Promise<NewHireInstance> {
    const template = await this.templateRepository.findOne({
      where: { id: createDto.templateId }
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${createDto.templateId} not found`);
    }

    if (!template.isPublished) {
      throw new BadRequestException('Cannot create instance from unpublished template');
    }

    const startDate = createDto.startDate || new Date().toISOString();
    const plannedCompletionDate = this.calculatePlannedCompletion(template, startDate);

    const instance = this.instanceRepository.create({
      templateId: createDto.templateId,
      employeeId: createDto.employeeId,
      status: 'NOT_STARTED',
      timeline: {
        startDate,
        plannedCompletionDate,
        actualStartDate: undefined,
        actualCompletionDate: undefined
      },
      progress: {
        overallPercentage: 0,
        phasesCompleted: 0,
        phasesTotal: template.workflow.phases.length,
        tasksCompleted: 0,
        tasksTotal: this.countTotalTasks(template),
        documentsSubmitted: 0,
        documentsTotal: 0,
        approvalsCompleted: 0,
        approvalsTotal: 0
      },
      collectedData: {},
      taskStatuses: this.initializeTaskStatuses(template),
      phaseStatuses: this.initializePhaseStatuses(template),
      participants: createDto.participants || {},
      auditLog: [
        {
          timestamp: new Date().toISOString(),
          actor: userId,
          action: 'INSTANCE_CREATED',
          details: 'Onboarding instance created'
        }
      ],
      metadata: {
        createdBy: userId
      }
    });

    const savedInstance = await this.instanceRepository.save(instance);

    // Create tasks from template
    await this.createTasksFromTemplate(savedInstance, template);

    return savedInstance;
  }

  /**
   * Find all instances with filters
   */
  async findAll(query: QueryInstancesDto): Promise<{ instances: NewHireInstance[]; total: number }> {
    const {
      templateId,
      employeeId,
      status,
      startDateFrom,
      startDateTo,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortDir = 'DESC'
    } = query;

    const where: FindOptionsWhere<NewHireInstance> = {};

    if (templateId) where.templateId = templateId;
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;

    const [instances, total] = await this.instanceRepository.findAndCount({
      where,
      relations: ['template'],
      order: { [sortBy]: sortDir },
      skip: (page - 1) * limit,
      take: limit
    });

    return { instances, total };
  }

  /**
   * Find one instance by ID
   */
  async findOne(id: string): Promise<NewHireInstance> {
    const instance = await this.instanceRepository.findOne({
      where: { id },
      relations: ['template', 'tasks', 'documents']
    });

    if (!instance) {
      throw new NotFoundException(`Instance with ID ${id} not found`);
    }

    return instance;
  }

  /**
   * Update instance
   */
  async update(id: string, updateDto: UpdateInstanceDto, userId: string): Promise<NewHireInstance> {
    const instance = await this.findOne(id);

    if (updateDto.status) {
      const now = new Date().toISOString();
      
      if (updateDto.status === 'IN_PROGRESS' && !instance.timeline.actualStartDate) {
        instance.timeline.actualStartDate = now;
      }

      if (updateDto.status === 'COMPLETED') {
        instance.timeline.actualCompletionDate = now;
        instance.progress.overallPercentage = 100;
      }

      instance.auditLog.push({
        timestamp: now,
        actor: userId,
        action: 'STATUS_CHANGED',
        details: `Status changed from ${instance.status} to ${updateDto.status}`
      });
    }

    Object.assign(instance, updateDto);
    instance.metadata = {
      ...instance.metadata,
      lastModifiedBy: userId
    };

    return this.instanceRepository.save(instance);
  }

  /**
   * Delete instance
   */
  async remove(id: string): Promise<void> {
    const instance = await this.findOne(id);
    await this.instanceRepository.remove(instance);
  }

  /**
   * Get instance progress
   */
  async getProgress(id: string): Promise<any> {
    const instance = await this.findOne(id);

    return {
      instanceId: id,
      employeeId: instance.employeeId,
      status: instance.status,
      overallPercentage: instance.progress.overallPercentage,
      phases: instance.phaseStatuses,
      tasks: instance.taskStatuses,
      timeline: instance.timeline
    };
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private calculatePlannedCompletion(template: NewHireTemplate, startDate: string): string {
    const durationDays = template.configuration.durationConfig?.estimatedDurationDays || 90;
    const start = new Date(startDate);
    const completion = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);
    return completion.toISOString();
  }

  private countTotalTasks(template: NewHireTemplate): number {
    return template.workflow.phases.reduce((total, phase) => total + phase.tasks.length, 0);
  }

  private initializeTaskStatuses(template: NewHireTemplate): any[] {
    const statuses: any[] = [];
    
    template.workflow.phases.forEach(phase => {
      phase.tasks.forEach(task => {
        statuses.push({
          taskId: task.id,
          phaseId: phase.id,
          status: 'NOT_STARTED',
          assignedTo: task.assignTo
        });
      });
    });

    return statuses;
  }

  private initializePhaseStatuses(template: NewHireTemplate): any[] {
    return template.workflow.phases.map(phase => ({
      phaseId: phase.id,
      status: 'NOT_STARTED',
      completionPercentage: 0
    }));
  }

  private async createTasksFromTemplate(
    instance: NewHireInstance,
    template: NewHireTemplate
  ): Promise<void> {
    const tasks: InstanceTask[] = [];

    template.workflow.phases.forEach(phase => {
      phase.tasks.forEach(task => {
        const instanceTask = this.taskRepository.create({
          instanceId: instance.id,
          taskId: task.id,
          phaseId: phase.id,
          name: task.name,
          description: task.description,
          status: 'NOT_STARTED',
          assignedTo: task.assignTo,
          priority: task.priority || 'MEDIUM',
          blocksAdvancement: task.blocksAdvancement || false,
          requiresApproval: task.requiresApproval || false,
          dependencies: task.dependencies || [],
          comments: [],
          attachments: []
        });

        tasks.push(instanceTask);
      });
    });

    await this.taskRepository.save(tasks);
  }
}

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(InstanceTask)
    private taskRepository: Repository<InstanceTask>,
    @InjectRepository(NewHireInstance)
    private instanceRepository: Repository<NewHireInstance>
  ) {}

  /**
   * Get task by ID
   */
  async findOne(id: string): Promise<InstanceTask> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['instance', 'approvals']
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  /**
   * Update task
   */
  async update(id: string, updateDto: UpdateTaskDto, userId: string): Promise<InstanceTask> {
    const task = await this.findOne(id);

    if (updateDto.status) {
      const now = new Date();

      if (updateDto.status === 'IN_PROGRESS' && !task.actualStartDate) {
        task.actualStartDate = now;
      }

      if (updateDto.status === 'COMPLETED') {
        task.actualCompletionDate = now;
        task.completedBy = userId;

        // Update instance progress
        await this.updateInstanceProgress(task.instanceId);
      }

      task.comments.push({
        timestamp: now.toISOString(),
        userId,
        text: `Task status changed to ${updateDto.status}`
      });
    }

    Object.assign(task, updateDto);
    return this.taskRepository.save(task);
  }

  /**
   * Add comment to task
   */
  async addComment(id: string, userId: string, comment: string): Promise<InstanceTask> {
    const task = await this.findOne(id);

    task.comments.push({
      timestamp: new Date().toISOString(),
      userId,
      text: comment
    });

    return this.taskRepository.save(task);
  }

  private async updateInstanceProgress(instanceId: string): Promise<void> {
    const instance = await this.instanceRepository.findOne({
      where: { id: instanceId },
      relations: ['tasks']
    });

    if (!instance) return;

    const completedTasks = instance.tasks.filter(t => t.status === 'COMPLETED').length;
    const totalTasks = instance.tasks.length;

    instance.progress.tasksCompleted = completedTasks;
    instance.progress.overallPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    await this.instanceRepository.save(instance);
  }
}
