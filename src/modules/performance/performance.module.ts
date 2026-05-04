import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerformanceService } from './performance.service';
import { PerformanceController } from './performance.controller';
import {
  PerformanceReview,
  PerformanceGoal,
  PerformanceCompetency,
} from './entities/performance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PerformanceReview, PerformanceGoal, PerformanceCompetency]),
  ],
  controllers: [PerformanceController],
  providers: [PerformanceService],
  exports: [PerformanceService],
})
export class PerformanceModule {}
