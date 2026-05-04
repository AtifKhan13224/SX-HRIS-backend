import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PicklistController } from './picklist.controller';
import { PicklistService } from './picklist.service';
import {
  Picklist,
  PicklistValue,
  PicklistDependency,
  PicklistVersion,
  PicklistUsageLog,
  PicklistAuditLog,
} from './entities/picklist.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Picklist,
      PicklistValue,
      PicklistDependency,
      PicklistVersion,
      PicklistUsageLog,
      PicklistAuditLog,
    ]),
  ],
  controllers: [PicklistController],
  providers: [PicklistService],
  exports: [PicklistService],
})
export class PicklistModule {}
