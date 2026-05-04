import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ScopeType {
  ORG_HIERARCHY = 'ORG_HIERARCHY',
  LEGAL_ENTITY = 'LEGAL_ENTITY',
  COUNTRY = 'COUNTRY',
  LOCATION = 'LOCATION',
  COST_CENTER = 'COST_CENTER',
  EMPLOYEE_GROUP = 'EMPLOYEE_GROUP',
  BUSINESS_UNIT = 'BUSINESS_UNIT',
  TIME_BOUND = 'TIME_BOUND',
  CUSTOM_FILTER = 'CUSTOM_FILTER',
}

export enum ScopeOperator {
  EQUALS = 'EQUALS',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
  CONTAINS = 'CONTAINS',
  STARTS_WITH = 'STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH',
  HIERARCHICAL = 'HIERARCHICAL',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  BETWEEN = 'BETWEEN',
}

export enum ScopeLogic {
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT',
}

@Entity('report_data_scopes')
@Index(['tenantId', 'reportId', 'roleId'])
@Index(['tenantId', 'isActive'])
@Index(['scopeType'])
export class ReportDataScope {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  @Index()
  tenantId: string;

  @Column({ name: 'report_id', type: 'uuid' })
  @Index()
  reportId: string;

  @Column({ name: 'role_id', type: 'uuid', nullable: true })
  @Index()
  roleId: string;

  @Column({ name: 'scope_name', length: 200 })
  scopeName: string;

  @Column({ name: 'scope_type', type: 'enum', enum: ScopeType })
  scopeType: ScopeType;

  @Column({ name: 'scope_operator', type: 'enum', enum: ScopeOperator })
  scopeOperator: ScopeOperator;

  @Column({ name: 'scope_value', type: 'text' })
  scopeValue: string;

  @Column({ name: 'scope_value_array', type: 'simple-array', nullable: true })
  scopeValueArray: string[];

  @Column({ name: 'scope_logic', type: 'enum', enum: ScopeLogic, default: ScopeLogic.AND })
  scopeLogic: ScopeLogic;

  @Column({ name: 'priority_order', type: 'integer', default: 0 })
  priorityOrder: number;

  // Dynamic scope evaluation
  @Column({ name: 'is_dynamic', type: 'boolean', default: false })
  isDynamic: boolean;

  @Column({ name: 'dynamic_expression', type: 'text', nullable: true })
  dynamicExpression: string;

  // Context-based scoping
  @Column({ name: 'use_user_context', type: 'boolean', default: false })
  useUserContext: boolean;

  @Column({ name: 'context_field', length: 100, nullable: true })
  contextField: string;

  // Hierarchical scoping
  @Column({ name: 'include_subordinates', type: 'boolean', default: false })
  includeSubordinates: boolean;

  @Column({ name: 'hierarchy_depth', type: 'integer', nullable: true })
  hierarchyDepth: number;

  // Time-based scoping
  @Column({ name: 'time_period_type', length: 50, nullable: true })
  timePeriodType: string; // CURRENT_MONTH, LAST_QUARTER, YTD, etc.

  @Column({ name: 'time_period_offset', type: 'integer', nullable: true })
  timePeriodOffset: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

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
