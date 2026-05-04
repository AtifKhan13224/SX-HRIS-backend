import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PerformanceService } from './performance.service';
import {
  CreatePerformanceReviewDto,
  UpdatePerformanceReviewDto,
  SelfReviewDto,
  ManagerReviewDto,
  ReviewQueryDto,
  CreatePerformanceGoalDto,
  UpdatePerformanceGoalDto,
  GoalQueryDto,
  CreateCompetencyDto,
  UpdateCompetencyDto,
} from './dto/performance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Performance')
@Controller('performance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  // Performance Review Endpoints
  @Post('reviews')
  @ApiOperation({ summary: 'Create a new performance review' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER)
  createReview(@Body() createReviewDto: CreatePerformanceReviewDto) {
    return this.performanceService.createReview(createReviewDto);
  }

  @Get('reviews')
  @ApiOperation({ summary: 'Get all performance reviews with filters' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER)
  findAllReviews(@Query() query: ReviewQueryDto) {
    return this.performanceService.findAllReviews(query);
  }

  @Get('reviews/:id')
  @ApiOperation({ summary: 'Get performance review by ID' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  findOneReview(@Param('id') id: string) {
    return this.performanceService.findOneReview(id);
  }

  @Patch('reviews/:id')
  @ApiOperation({ summary: 'Update performance review' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER)
  updateReview(@Param('id') id: string, @Body() updateReviewDto: UpdatePerformanceReviewDto) {
    return this.performanceService.updateReview(id, updateReviewDto);
  }

  @Delete('reviews/:id')
  @ApiOperation({ summary: 'Delete performance review' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  deleteReview(@Param('id') id: string) {
    return this.performanceService.deleteReview(id);
  }

  @Post('reviews/:id/self-review')
  @ApiOperation({ summary: 'Submit self review' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  submitSelfReview(@Param('id') id: string, @Body() selfReviewDto: SelfReviewDto) {
    return this.performanceService.submitSelfReview(id, selfReviewDto);
  }

  @Post('reviews/:id/manager-review')
  @ApiOperation({ summary: 'Submit manager review' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER)
  submitManagerReview(@Param('id') id: string, @Body() managerReviewDto: ManagerReviewDto) {
    return this.performanceService.submitManagerReview(id, managerReviewDto);
  }

  @Post('reviews/:id/complete')
  @ApiOperation({ summary: 'Complete performance review' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER)
  completeReview(@Param('id') id: string) {
    return this.performanceService.completeReview(id);
  }

  // Performance Goal Endpoints
  @Post('goals')
  @ApiOperation({ summary: 'Create a new performance goal' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  createGoal(@Body() createGoalDto: CreatePerformanceGoalDto) {
    return this.performanceService.createGoal(createGoalDto);
  }

  @Get('goals')
  @ApiOperation({ summary: 'Get all performance goals with filters' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  findAllGoals(@Query() query: GoalQueryDto) {
    return this.performanceService.findAllGoals(query);
  }

  @Get('goals/:id')
  @ApiOperation({ summary: 'Get performance goal by ID' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  findOneGoal(@Param('id') id: string) {
    return this.performanceService.findOneGoal(id);
  }

  @Patch('goals/:id')
  @ApiOperation({ summary: 'Update performance goal' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  updateGoal(@Param('id') id: string, @Body() updateGoalDto: UpdatePerformanceGoalDto) {
    return this.performanceService.updateGoal(id, updateGoalDto);
  }

  @Delete('goals/:id')
  @ApiOperation({ summary: 'Delete performance goal' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER)
  deleteGoal(@Param('id') id: string) {
    return this.performanceService.deleteGoal(id);
  }

  @Patch('goals/:id/progress')
  @ApiOperation({ summary: 'Update goal progress' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  updateGoalProgress(@Param('id') id: string, @Body('progress') progress: number) {
    return this.performanceService.updateGoalProgress(id, progress);
  }

  // Competency Endpoints
  @Post('competencies')
  @ApiOperation({ summary: 'Create a new competency' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER)
  createCompetency(@Body() createCompetencyDto: CreateCompetencyDto) {
    return this.performanceService.createCompetency(createCompetencyDto);
  }

  @Get('competencies')
  @ApiOperation({ summary: 'Get all competencies' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER)
  findAllCompetencies() {
    return this.performanceService.findAllCompetencies();
  }

  @Get('competencies/:id')
  @ApiOperation({ summary: 'Get competency by ID' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER)
  findOneCompetency(@Param('id') id: string) {
    return this.performanceService.findOneCompetency(id);
  }

  @Patch('competencies/:id')
  @ApiOperation({ summary: 'Update competency' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER)
  updateCompetency(@Param('id') id: string, @Body() updateCompetencyDto: UpdateCompetencyDto) {
    return this.performanceService.updateCompetency(id, updateCompetencyDto);
  }

  @Delete('competencies/:id')
  @ApiOperation({ summary: 'Delete competency' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  deleteCompetency(@Param('id') id: string) {
    return this.performanceService.deleteCompetency(id);
  }

  // Statistics
  @Get('stats/employee/:employeeId')
  @ApiOperation({ summary: 'Get employee performance statistics' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  getEmployeePerformanceStats(@Param('employeeId') employeeId: string) {
    return this.performanceService.getEmployeePerformanceStats(employeeId);
  }
}
