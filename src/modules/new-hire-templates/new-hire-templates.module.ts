import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  NewHireTemplate,
  NewHireInstance,
  InstanceTask,
  TaskApproval,
  InstanceDocument,
  AutomationLog,
  NotificationLog
} from './entities';
import {
  TemplateService,
  InstanceService,
  TaskService
} from './services';
import {
  TemplateController,
  InstanceController,
  TaskController,
  AnalyticsController
} from './controllers';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NewHireTemplate,
      NewHireInstance,
      InstanceTask,
      TaskApproval,
      InstanceDocument,
      AutomationLog,
      NotificationLog
    ])
  ],
  controllers: [
    TemplateController,
    InstanceController,
    TaskController,
    AnalyticsController
  ],
  providers: [
    TemplateService,
    InstanceService,
    TaskService
  ],
  exports: [
    TemplateService,
    InstanceService,
    TaskService
  ]
})
export class NewHireTemplatesModule {}
