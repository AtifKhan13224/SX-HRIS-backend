import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';

@Entity('rbac_permission_templates')
@Index(['templateCode'], { unique: true })
@Index(['templateCategory'])
@Index(['isActive'])
export class RBACPermissionTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Template Identification
  @Column({ type: 'varchar', length: 100, unique: true })
  templateCode: string; // e.g., 'TEMPLATE_HR_MANAGER'

  @Column({ type: 'varchar', length: 255 })
  templateName: string;

  @Column({ type: 'text', nullable: true })
  templateDescription: string;

  // Template Category
  @Column({ type: 'varchar', length: 100 })
  templateCategory: string; // HR, Finance, Operations, Executive, etc.

  // Template Icon and Display
  @Column({ type: 'varchar', length: 50, nullable: true })
  icon: string; // Lucide icon name

  @Column({ type: 'varchar', length: 50, nullable: true })
  color: string; // Color for UI display

  @Column({ type: 'integer', default: 0 })
  displayOrder: number;

  // Permission Configuration
  @Column({ type: 'jsonb' })
  permissions: {
    module: string;
    subModule?: string;
    permissions: string[]; // Array of permission codes
    dataScope?: string;
  }[];

  // Template Metadata
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isSystemTemplate: boolean; // Cannot be deleted/modified

  @Column({ type: 'boolean', default: true })
  isRecommended: boolean; // Show in recommended templates

  // Usage Statistics
  @Column({ type: 'integer', default: 0 })
  usageCount: number; // How many times this template has been used

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date;

  // Tenant
  @Column({ type: 'uuid', nullable: true })
  tenantId: string;

  // Audit Fields
  @Column({ type: 'varchar', length: 100, nullable: true })
  createdBy: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updatedBy: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Soft Delete
  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  deletedBy: string;
}
