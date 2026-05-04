import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum CategoryDomain {
  EMPLOYEE_MASTER = 'EMPLOYEE_MASTER',
  COMPENSATION_PAYROLL = 'COMPENSATION_PAYROLL',
  ATTENDANCE_LEAVE = 'ATTENDANCE_LEAVE',
  PERFORMANCE_TALENT = 'PERFORMANCE_TALENT',
  COMPLIANCE_REGULATORY = 'COMPLIANCE_REGULATORY',
  EXECUTIVE_DASHBOARDS = 'EXECUTIVE_DASHBOARDS',
  RECRUITMENT = 'RECRUITMENT',
  TRAINING_DEVELOPMENT = 'TRAINING_DEVELOPMENT',
}

@Entity('report_categories')
@Index(['tenantId', 'domain'])
@Index(['tenantId', 'isActive'])
export class ReportCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'category_code', length: 50, unique: true })
  @Index()
  categoryCode: string;

  @Column({ name: 'category_name', length: 200 })
  categoryName: string;

  @Column({ type: 'enum', enum: CategoryDomain })
  domain: CategoryDomain;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'parent_category_id', type: 'uuid', nullable: true })
  parentCategoryId: string;

  @Column({ name: 'hierarchy_level', type: 'integer', default: 0 })
  hierarchyLevel: number;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;

  @Column({ name: 'icon_name', length: 50, nullable: true })
  iconName: string;

  @Column({ name: 'color_code', length: 20, nullable: true })
  colorCode: string;

  @Column({ name: 'is_system_defined', type: 'boolean', default: false })
  isSystemDefined: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
