import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GroupCompany } from '../../organization-settings/entities/group-company.entity';

@Entity('recruitment_stages')
export class RecruitmentStage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'group_company_id', nullable: true })
  groupCompanyId: string;

  @ManyToOne(() => GroupCompany)
  @JoinColumn({ name: 'group_company_id' })
  groupCompany: GroupCompany;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50 })
  type: string; // Screening, Assessment, Interview, Offer, Onboarding, Rejected, Withdrawn

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  sequence: number; // Order in the pipeline

  @Column({ length: 50 })
  category: string; // Application, Evaluation, Decision, Completion

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ default: false })
  requiresApproval: boolean;

  @Column({ default: false })
  sendEmailNotification: boolean;

  @Column({ default: false })
  sendSmsNotification: boolean;

  @Column({ type: 'text', nullable: true })
  emailTemplate: string;

  @Column({ type: 'text', nullable: true })
  smsTemplate: string;

  @Column({ length: 20, nullable: true })
  color: string; // For UI display

  @Column({ length: 50, nullable: true })
  icon: string; // For UI display

  @Column({ type: 'jsonb', nullable: true })
  autoActions: any; // Automated actions when stage is reached

  @Column({ type: 'jsonb', nullable: true })
  requiredFields: any; // Fields that must be filled in this stage

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string;
}
