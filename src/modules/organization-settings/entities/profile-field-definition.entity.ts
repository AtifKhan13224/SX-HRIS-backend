import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { ProfileFieldOption } from './profile-field-option.entity';

@Entity('profile_field_definitions')
@Index(['tenantId', 'fieldKey'], { unique: true })
export class ProfileFieldDefinition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  @Index()
  tenantId: string;

  @Column({ type: 'varchar', length: 100 })
  fieldKey: string; // e.g., 'gender', 'marital_status', 'employment_type'

  @Column({ type: 'varchar', length: 200 })
  fieldName: string; // Display name: 'Gender', 'Marital Status'

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  fieldType: string; // 'single_select', 'multi_select', 'text', 'number', 'date', 'boolean'

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string; // 'personal', 'employment', 'contact', 'identification', 'custom'

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isRequired: boolean;

  @Column({ type: 'boolean', default: false })
  isSystem: boolean; // System fields cannot be deleted

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'jsonb', nullable: true })
  validationRules: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    allowCustomValues?: boolean;
    maxSelections?: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  uiConfig: {
    displayType?: string; // 'dropdown', 'radio', 'checkbox', 'autocomplete'
    icon?: string;
    helpText?: string;
    placeholder?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  translations: {
    [locale: string]: {
      fieldName: string;
      description?: string;
      helpText?: string;
    };
  };

  @OneToMany(() => ProfileFieldOption, (option) => option.fieldDefinition)
  options: ProfileFieldOption[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;
}
