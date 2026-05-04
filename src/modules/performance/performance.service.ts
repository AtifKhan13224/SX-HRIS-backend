import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PerformanceReview,
  PerformanceGoal,
  PerformanceCompetency,
  ReviewStatus,
  GoalStatus,
} from './entities/performance.entity';
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

@Injectable()
export class PerformanceService {
  constructor(
    @InjectRepository(PerformanceReview)
    private reviewRepository: Repository<PerformanceReview>,
    @InjectRepository(PerformanceGoal)
    private goalRepository: Repository<PerformanceGoal>,
    @InjectRepository(PerformanceCompetency)
    private competencyRepository: Repository<PerformanceCompetency>,
  ) {}

  // Performance Review Methods
  async createReview(createReviewDto: CreatePerformanceReviewDto): Promise<PerformanceReview> {
    const review = this.reviewRepository.create(createReviewDto);
    return this.reviewRepository.save(review);
  }

  async findAllReviews(query: ReviewQueryDto): Promise<{
    data: PerformanceReview[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { employeeId, reviewerId, status, reviewPeriod, page = 1, limit = 10 } = query;

    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.employee', 'employee')
      .leftJoinAndSelect('review.reviewer', 'reviewer');

    if (employeeId) {
      queryBuilder.andWhere('review.employeeId = :employeeId', { employeeId });
    }

    if (reviewerId) {
      queryBuilder.andWhere('review.reviewerId = :reviewerId', { reviewerId });
    }

    if (status) {
      queryBuilder.andWhere('review.status = :status', { status });
    }

    if (reviewPeriod) {
      queryBuilder.andWhere('review.reviewPeriod = :reviewPeriod', { reviewPeriod });
    }

    const total = await queryBuilder.getCount();
    const data = await queryBuilder
      .orderBy('review.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, page, limit };
  }

  async findOneReview(id: string): Promise<PerformanceReview> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['employee', 'reviewer'],
    });

    if (!review) {
      throw new NotFoundException(`Performance review with ID ${id} not found`);
    }

    return review;
  }

  async updateReview(
    id: string,
    updateReviewDto: UpdatePerformanceReviewDto,
  ): Promise<PerformanceReview> {
    const review = await this.findOneReview(id);

    if (review.status === ReviewStatus.COMPLETED) {
      throw new BadRequestException('Cannot update completed review');
    }

    Object.assign(review, updateReviewDto);
    return this.reviewRepository.save(review);
  }

  async deleteReview(id: string): Promise<void> {
    const review = await this.findOneReview(id);
    await this.reviewRepository.remove(review);
  }

  async submitSelfReview(id: string, selfReviewDto: SelfReviewDto): Promise<PerformanceReview> {
    const review = await this.findOneReview(id);

    if (review.status !== ReviewStatus.NOT_STARTED && review.status !== ReviewStatus.IN_PROGRESS) {
      throw new BadRequestException('Review is not in a state to accept self review');
    }

    review.selfRating = selfReviewDto.selfRating;
    review.selfComments = selfReviewDto.selfComments;
    review.competencyRatings = selfReviewDto.competencyRatings || review.competencyRatings;
    review.status = ReviewStatus.SELF_REVIEW_COMPLETED;
    review.selfReviewCompletedAt = new Date();

    return this.reviewRepository.save(review);
  }

  async submitManagerReview(
    id: string,
    managerReviewDto: ManagerReviewDto,
  ): Promise<PerformanceReview> {
    const review = await this.findOneReview(id);

    if (review.status !== ReviewStatus.SELF_REVIEW_COMPLETED) {
      throw new BadRequestException('Self review must be completed first');
    }

    review.managerRating = managerReviewDto.managerRating;
    review.managerComments = managerReviewDto.managerComments;
    review.finalRating = managerReviewDto.finalRating;
    review.competencyRatings = {
      ...review.competencyRatings,
      ...managerReviewDto.competencyRatings,
    };
    review.strengths = managerReviewDto.strengths;
    review.areasOfImprovement = managerReviewDto.areasOfImprovement;
    review.developmentPlan = managerReviewDto.developmentPlan;
    review.status = ReviewStatus.MANAGER_REVIEW_COMPLETED;
    review.managerReviewCompletedAt = new Date();

    return this.reviewRepository.save(review);
  }

  async completeReview(id: string): Promise<PerformanceReview> {
    const review = await this.findOneReview(id);

    if (review.status !== ReviewStatus.MANAGER_REVIEW_COMPLETED) {
      throw new BadRequestException('Manager review must be completed first');
    }

    review.status = ReviewStatus.COMPLETED;
    return this.reviewRepository.save(review);
  }

  // Performance Goal Methods
  async createGoal(createGoalDto: CreatePerformanceGoalDto): Promise<PerformanceGoal> {
    const goal = this.goalRepository.create(createGoalDto);
    return this.goalRepository.save(goal);
  }

  async findAllGoals(query: GoalQueryDto): Promise<{
    data: PerformanceGoal[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { employeeId, status, page = 1, limit = 10 } = query;

    const queryBuilder = this.goalRepository
      .createQueryBuilder('goal')
      .leftJoinAndSelect('goal.employee', 'employee');

    if (employeeId) {
      queryBuilder.andWhere('goal.employeeId = :employeeId', { employeeId });
    }

    if (status) {
      queryBuilder.andWhere('goal.status = :status', { status });
    }

    const total = await queryBuilder.getCount();
    const data = await queryBuilder
      .orderBy('goal.targetDate', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, page, limit };
  }

  async findOneGoal(id: string): Promise<PerformanceGoal> {
    const goal = await this.goalRepository.findOne({
      where: { id },
      relations: ['employee'],
    });

    if (!goal) {
      throw new NotFoundException(`Performance goal with ID ${id} not found`);
    }

    return goal;
  }

  async updateGoal(id: string, updateGoalDto: UpdatePerformanceGoalDto): Promise<PerformanceGoal> {
    const goal = await this.findOneGoal(id);
    Object.assign(goal, updateGoalDto);

    // If status is being changed to completed, set completed date
    if (updateGoalDto.status === GoalStatus.COMPLETED && !goal.completedDate) {
      goal.completedDate = new Date();
      goal.progress = 100;
    }

    return this.goalRepository.save(goal);
  }

  async deleteGoal(id: string): Promise<void> {
    const goal = await this.findOneGoal(id);
    await this.goalRepository.remove(goal);
  }

  async updateGoalProgress(id: string, progress: number): Promise<PerformanceGoal> {
    const goal = await this.findOneGoal(id);

    goal.progress = progress;

    if (progress === 100 && goal.status !== GoalStatus.COMPLETED) {
      goal.status = GoalStatus.COMPLETED;
      goal.completedDate = new Date();
    } else if (progress > 0 && goal.status === GoalStatus.NOT_STARTED) {
      goal.status = GoalStatus.IN_PROGRESS;
    }

    return this.goalRepository.save(goal);
  }

  // Competency Methods
  async createCompetency(createCompetencyDto: CreateCompetencyDto): Promise<PerformanceCompetency> {
    const competency = this.competencyRepository.create(createCompetencyDto);
    return this.competencyRepository.save(competency);
  }

  async findAllCompetencies(): Promise<PerformanceCompetency[]> {
    return this.competencyRepository.find({ where: { isActive: true } });
  }

  async findOneCompetency(id: string): Promise<PerformanceCompetency> {
    const competency = await this.competencyRepository.findOne({ where: { id } });

    if (!competency) {
      throw new NotFoundException(`Competency with ID ${id} not found`);
    }

    return competency;
  }

  async updateCompetency(
    id: string,
    updateCompetencyDto: UpdateCompetencyDto,
  ): Promise<PerformanceCompetency> {
    const competency = await this.findOneCompetency(id);
    Object.assign(competency, updateCompetencyDto);
    return this.competencyRepository.save(competency);
  }

  async deleteCompetency(id: string): Promise<void> {
    const competency = await this.findOneCompetency(id);
    competency.isActive = false;
    await this.competencyRepository.save(competency);
  }

  // Statistics
  async getEmployeePerformanceStats(employeeId: string): Promise<any> {
    const reviews = await this.reviewRepository.find({
      where: { employeeId },
      order: { reviewStartDate: 'DESC' },
    });

    const goals = await this.goalRepository.find({
      where: { employeeId },
    });

    const avgRating =
      reviews
        .filter((r) => r.finalRating)
        .reduce((sum, r) => sum + Number(r.finalRating), 0) / reviews.length || 0;

    return {
      totalReviews: reviews.length,
      completedReviews: reviews.filter((r) => r.status === ReviewStatus.COMPLETED).length,
      averageRating: avgRating.toFixed(2),
      totalGoals: goals.length,
      completedGoals: goals.filter((g) => g.status === GoalStatus.COMPLETED).length,
      inProgressGoals: goals.filter((g) => g.status === GoalStatus.IN_PROGRESS).length,
      recentReviews: reviews.slice(0, 5),
    };
  }
}
