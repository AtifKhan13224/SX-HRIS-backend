import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TemplateService, InstanceService, TaskService } from '../services';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  PublishTemplateDto,
  CreateInstanceDto,
  UpdateInstanceDto,
  UpdateTaskDto,
  AddTaskCommentDto,
  QueryTemplatesDto,
  QueryInstancesDto,
  AnalyticsQueryDto,
  BulkActionDto
} from '../dto';

@ApiTags('Templates')
@Controller('api/new-hire-templates')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard) // Uncomment when auth is ready
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post()
  @ApiOperation({ summary: 'Create new onboarding template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  async create(@Body() createDto: CreateTemplateDto, @Request() req): Promise<any> {
    const userId = req.user?.id || 'system';
    return this.templateService.create(createDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all templates with filters' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async findAll(@Query() query: QueryTemplatesDto): Promise<any> {
    return this.templateService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  @ApiResponse({ status: 200, description: 'Template found' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async findOne(@Param('id') id: string): Promise<any> {
    return this.templateService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update template' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTemplateDto,
    @Request() req
  ): Promise<any> {
    const userId = req.user?.id || 'system';
    return this.templateService.update(id, updateDto, userId);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish template' })
  @ApiResponse({ status: 200, description: 'Template published successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async publish(
    @Param('id') id: string,
    @Body() publishDto: PublishTemplateDto,
    @Request() req
  ): Promise<any> {
    const userId = req.user?.id || 'system';
    return this.templateService.publish(id, publishDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete template (soft delete)' })
  @ApiResponse({ status: 200, description: 'Template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.templateService.remove(id);
  }

  @Post(':id/clone')
  @ApiOperation({ summary: 'Clone template' })
  @ApiResponse({ status: 201, description: 'Template cloned successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async clone(@Param('id') id: string, @Request() req): Promise<any> {
    const userId = req.user?.id || 'system';
    return this.templateService.clone(id, userId);
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get template analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async getAnalytics(@Param('id') id: string): Promise<any> {
    return this.templateService.getAnalytics(id);
  }
}

@ApiTags('Onboarding Instances')
@Controller('api/onboarding/instances')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard) // Uncomment when auth is ready
export class InstanceController {
  constructor(
    private readonly instanceService: InstanceService,
    private readonly taskService: TaskService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create new onboarding instance' })
  @ApiResponse({ status: 201, description: 'Instance created successfully' })
  async create(@Body() createDto: CreateInstanceDto, @Request() req): Promise<any> {
    const userId = req.user?.id || 'system';
    return this.instanceService.create(createDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all instances with filters' })
  @ApiResponse({ status: 200, description: 'Instances retrieved successfully' })
  async findAll(@Query() query: QueryInstancesDto): Promise<any> {
    return this.instanceService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get instance by ID' })
  @ApiResponse({ status: 200, description: 'Instance found' })
  @ApiResponse({ status: 404, description: 'Instance not found' })
  async findOne(@Param('id') id: string): Promise<any> {
    return this.instanceService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update instance' })
  @ApiResponse({ status: 200, description: 'Instance updated successfully' })
  @ApiResponse({ status: 404, description: 'Instance not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateInstanceDto,
    @Request() req
  ): Promise<any> {
    const userId = req.user?.id || 'system';
    return this.instanceService.update(id, updateDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete instance' })
  @ApiResponse({ status: 200, description: 'Instance deleted successfully' })
  @ApiResponse({ status: 404, description: 'Instance not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.instanceService.remove(id);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Get instance progress' })
  @ApiResponse({ status: 200, description: 'Progress retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Instance not found' })
  async getProgress(@Param('id') id: string): Promise<any> {
    return this.instanceService.getProgress(id);
  }
}

@ApiTags('Tasks')
@Controller('api/onboarding/tasks')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard) // Uncomment when auth is ready
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiResponse({ status: 200, description: 'Task found' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async findOne(@Param('id') id: string): Promise<any> {
    return this.taskService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update task' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTaskDto,
    @Request() req
  ): Promise<any> {
    const userId = req.user?.id || 'system';
    return this.taskService.update(id, updateDto, userId);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add comment to task' })
  @ApiResponse({ status: 201, description: 'Comment added successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async addComment(
    @Param('id') id: string,
    @Body() commentDto: AddTaskCommentDto,
    @Request() req
  ): Promise<any> {
    const userId = req.user?.id || commentDto.userId;
    return this.taskService.addComment(id, userId, commentDto.comment);
  }
}

@ApiTags('Analytics')
@Controller('api/onboarding/analytics')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard) // Uncomment when auth is ready
export class AnalyticsController {
  @Get('pipeline')
  @ApiOperation({ summary: 'Get onboarding pipeline overview' })
  @ApiResponse({ status: 200, description: 'Pipeline data retrieved successfully' })
  async getPipeline(@Query() query: AnalyticsQueryDto): Promise<any> {
    // TODO: Implement pipeline analytics
    return {
      total: 0,
      byStatus: {},
      byPhase: {},
      upcoming: [],
      overdue: []
    };
  }

  @Get('completion-rate')
  @ApiOperation({ summary: 'Get completion rate analytics' })
  @ApiResponse({ status: 200, description: 'Completion rate retrieved successfully' })
  async getCompletionRate(@Query() query: AnalyticsQueryDto): Promise<any> {
    // TODO: Implement completion rate analytics
    return {
      overallRate: 0,
      byTemplate: [],
      trend: []
    };
  }

  @Get('bottlenecks')
  @ApiOperation({ summary: 'Get bottleneck analysis' })
  @ApiResponse({ status: 200, description: 'Bottlenecks identified' })
  async getBottlenecks(@Query() query: AnalyticsQueryDto): Promise<any> {
    // TODO: Implement bottleneck detection
    return {
      stuckInstances: [],
      delayedPhases: [],
      pendingApprovals: []
    };
  }

  @Get('compliance')
  @ApiOperation({ summary: 'Get compliance status' })
  @ApiResponse({ status: 200, description: 'Compliance data retrieved successfully' })
  async getCompliance(@Query() query: AnalyticsQueryDto): Promise<any> {
    // TODO: Implement compliance tracking
    return {
      documentSubmissionRate: 0,
      missingDocuments: [],
      complianceScore: 0
    };
  }
}
