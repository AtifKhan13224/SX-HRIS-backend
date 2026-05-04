import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn
} from 'typeorm';

@Entity('new_hire_templates')
export class NewHireTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50, default: 'ONBOARDING' })
  templateType: string;

  @Column({ type: 'varchar', length: 20, default: '1.0.0' })
  version: string;

  @Column({ type: 'jsonb' })
  configuration: Record<string, any>;

  @Column({ type: 'jsonb' })
  pages: Record<string, any>[];

  @Column({ type: 'jsonb' })
  workflow: Record<string, any>;

  @Column({ type: 'jsonb' })
  roles: Record<string, any>[];

  @Column({ type: 'jsonb' })
  dashboards: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  integrations: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  automations: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  notifications: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  analytics: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isPublished: boolean;

  @Column({ type: 'varchar', length: 50, default: 'DRAFT' })
  publishingStatus: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  author: string;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  classification: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  usage: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => NewHireInstance, (instance) => instance.template)
  instances: NewHireInstance[];
}

@Entity('new_hire_instances')
export class NewHireInstance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  templateId: string;

  @Column({ type: 'uuid' })
  employeeId: string;

  @Column({ type: 'varchar', length: 50, default: 'NOT_STARTED' })
  status: string;

  @Column({ type: 'jsonb' })
  timeline: Record<string, any>;

  @Column({ type: 'jsonb' })
  progress: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  collectedData: Record<string, any>;

  @Column({ type: 'jsonb' })
  taskStatuses: Record<string, any>[];

  @Column({ type: 'jsonb' })
  phaseStatuses: Record<string, any>[];

  @Column({ type: 'jsonb', default: {} })
  participants: Record<string, any>;

  @Column({ type: 'jsonb', default: [] })
  auditLog: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => NewHireTemplate, (template) => template.instances)
  @JoinColumn({ name: 'templateId' })
  template: NewHireTemplate;

  @OneToMany(() => InstanceTask, (task) => task.instance)
  tasks: InstanceTask[];

  @OneToMany(() => InstanceDocument, (doc) => doc.instance)
  documents: InstanceDocument[];
}

@Entity('instance_tasks')
export class InstanceTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  instanceId: string;

  @Column({ type: 'varchar', length: 255 })
  taskId: string;

  @Column({ type: 'varchar', length: 255 })
  phaseId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50, default: 'NOT_STARTED' })
  status: string;

  @Column({ type: 'varchar', length: 50 })
  assignedTo: string;

  @Column({ type: 'uuid', nullable: true })
  assignedUserId: string;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualStartDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualCompletionDate: Date;

  @Column({ type: 'uuid', nullable: true })
  completedBy: string;

  @Column({ type: 'varchar', length: 50, default: 'MEDIUM' })
  priority: string;

  @Column({ type: 'boolean', default: false })
  blocksAdvancement: boolean;

  @Column({ type: 'boolean', default: false })
  requiresApproval: boolean;

  @Column({ type: 'jsonb', nullable: true })
  approvalRequirements: Record<string, any>;

  @Column({ type: 'jsonb', default: [] })
  dependencies: string[];

  @Column({ type: 'jsonb', default: [] })
  comments: Record<string, any>[];

  @Column({ type: 'jsonb', default: [] })
  attachments: Record<string, any>[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => NewHireInstance, (instance) => instance.tasks)
  @JoinColumn({ name: 'instanceId' })
  instance: NewHireInstance;

  @OneToMany(() => TaskApproval, (approval) => approval.task)
  approvals: TaskApproval[];
}

@Entity('task_approvals')
export class TaskApproval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  taskId: string;

  @Column({ type: 'uuid' })
  approverId: string;

  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  status: string;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => InstanceTask, (task) => task.approvals)
  @JoinColumn({ name: 'taskId' })
  task: InstanceTask;
}

@Entity('instance_documents')
export class InstanceDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  instanceId: string;

  @Column({ type: 'varchar', length: 255 })
  documentCategory: string;

  @Column({ type: 'varchar', length: 500 })
  fileName: string;

  @Column({ type: 'varchar', length: 1000 })
  filePath: string;

  @Column({ type: 'varchar', length: 50 })
  fileType: string;

  @Column({ type: 'bigint' })
  fileSize: number;

  @Column({ type: 'boolean', default: false })
  isRequired: boolean;

  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  status: string;

  @Column({ type: 'uuid', nullable: true })
  uploadedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  uploadedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  verifiedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'boolean', default: false })
  virusScanCompleted: boolean;

  @Column({ type: 'boolean', default: true })
  virusScanPassed: boolean;

  @Column({ type: 'boolean', default: false })
  ocrCompleted: boolean;

  @Column({ type: 'text', nullable: true })
  ocrText: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => NewHireInstance, (instance) => instance.documents)
  @JoinColumn({ name: 'instanceId' })
  instance: NewHireInstance;
}

@Entity('automation_logs')
export class AutomationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  instanceId: string;

  @Column({ type: 'varchar', length: 255 })
  automationId: string;

  @Column({ type: 'varchar', length: 50 })
  automationType: string;

  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  status: string;

  @Column({ type: 'timestamp' })
  triggeredAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  executedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  input: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  output: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'integer', default: 0 })
  retryCount: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('notification_logs')
export class NotificationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  instanceId: string;

  @Column({ type: 'varchar', length: 255 })
  notificationId: string;

  @Column({ type: 'varchar', length: 50 })
  channel: string;

  @Column({ type: 'uuid' })
  recipientId: string;

  @Column({ type: 'varchar', length: 500 })
  subject: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'integer', default: 0 })
  retryCount: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
