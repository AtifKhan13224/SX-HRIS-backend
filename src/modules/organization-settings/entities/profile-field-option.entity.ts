import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProfileFieldDefinition } from './profile-field-definition.entity';

@Entity('profile_field_options')
@Index(['tenantId', 'fieldDefinitionId'])
@Index(['tenantId', 'fieldDefinitionId', 'code'], { unique: true })
export class ProfileFieldOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  @Index()
  tenantId: string;

  @Column({ type: 'uuid' })
  fieldDefinitionId: string;

  @ManyToOne(() => ProfileFieldDefinition, (field) => field.options)
  @JoinColumn({ name: 'fieldDefinitionId' })
  fieldDefinition: ProfileFieldDefinition;

  @Column({ type: 'varchar', length: 100 })
  code: string; // Unique identifier: 'male', 'female', 'single', 'married'

  @Column({ type: 'varchar', length: 200 })
  displayValue: string; // Display text: 'Male', 'Female', 'Single', 'Married'

  @Column({ type: 'varchar', length: 200, nullable: true })
  alias: string; // Alternative name or abbreviation

  @Column({ type: 'boolean', default: true })
  isEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'boolean', default: false })
  isSystem: boolean; // System options cannot be deleted

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'jsonb', nullable: true })
  applicableFor: {
    employeeTypes?: string[]; // ['permanent', 'contract', 'intern']
    departments?: string[]; // Department IDs
    locations?: string[]; // Location IDs
    roles?: string[]; // Role IDs
    customRules?: any[];
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    color?: string;
    icon?: string;
    badgeStyle?: string;
    externalCode?: string; // For integration with external systems
    legalCompliance?: string[];
    [key: string]: any;
  };

  @Column({ type: 'jsonb', nullable: true })
  translations: {
    [locale: string]: {
      displayValue: string;
      alias?: string;
      description?: string;
    };
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;
}
