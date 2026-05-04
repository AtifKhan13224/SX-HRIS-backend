import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { PermissionRegistry } from './permission-registry.entity';

export enum FieldSecurityAction {
  HIDE = 'HIDE',
  MASK = 'MASK',
  PARTIAL = 'PARTIAL',
  READ_ONLY = 'READ_ONLY',
  EDITABLE = 'EDITABLE'
}

export enum MaskingType {
  FULL = 'FULL',
  PARTIAL_START = 'PARTIAL_START',
  PARTIAL_END = 'PARTIAL_END',
  PARTIAL_MIDDLE = 'PARTIAL_MIDDLE',
  HASH = 'HASH',
  TOKENIZE = 'TOKENIZE',
  REDACT = 'REDACT'
}

@Entity('field_level_security')
@Index(['permissionId', 'entityType', 'fieldName', 'isActive'])
@Index(['tenantId', 'entityType'])
@Index(['countryCode', 'isActive'])
export class FieldLevelSecurity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  permissionId: string;

  @Column({ length: 100 })
  @Index()
  entityType: string;

  @Column({ length: 100 })
  fieldName: string;

  @Column({ length: 255, nullable: true })
  fieldDisplayName: string;

  @Column({
    type: 'enum',
    enum: FieldSecurityAction
  })
  securityAction: FieldSecurityAction;

  @Column({ default: true })
  isActive: boolean;

  @Column({ length: 100, nullable: true })
  @Index()
  tenantId: string;

  @Column({ length: 10, nullable: true })
  @Index()
  countryCode: string;

  @Column({ default: false })
  isCountrySpecific: boolean;

  @Column({ default: false })
  isConditional: boolean;

  @Column({ type: 'jsonb', nullable: true })
  conditions: Record<string, any>;

  @Column({
    type: 'enum',
    enum: MaskingType,
    nullable: true
  })
  maskingType: MaskingType;

  @Column({ length: 10, nullable: true })
  maskingChar: string;

  @Column({ type: 'int', nullable: true })
  visibleChars: number;

  @Column({ type: 'jsonb', nullable: true })
  partialVisibilityConfig: {
    showStart: number;
    showEnd: number;
    maskMiddle: boolean;
  };

  @Column({ default: false })
  allowExport: boolean;

  @Column({ default: false })
  allowPrint: boolean;

  @Column({ default: false })
  requiresApprovalToView: boolean;

  @Column({ length: 100, nullable: true })
  approverRole: string;

  @Column({ type: 'int', default: 0 })
  viewDurationMinutes: number;

  @Column({ default: false })
  auditOnAccess: boolean;

  @Column({ type: 'jsonb', nullable: true })
  allowedValues: string[];

  @Column({ type: 'jsonb', nullable: true })
  validationRules: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ length: 100 })
  createdBy: string;

  @ManyToOne(() => PermissionRegistry, permission => permission.fieldSecurityRules)
  @JoinColumn({ name: 'permissionId' })
  permission: PermissionRegistry;
}
