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

@Entity('recruitment_sources')
export class RecruitmentSource {
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
  type: string; // Job Board, Social Media, Employee Referral, Career Page, Agency, Campus, Walk-in, Internal

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 500, nullable: true })
  url: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number;

  @Column({ length: 20, nullable: true })
  costType: string; // Per Hire, Monthly, Annual, Per Post

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isPrimary: boolean;

  @Column({ default: 0 })
  candidatesReceived: number;

  @Column({ default: 0 })
  candidatesHired: number;

  @Column({ type: 'jsonb', nullable: true })
  configuration: any; // API keys, integration settings, etc.

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
