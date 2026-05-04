import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CompanyProfile } from './company-profile.entity';

@Entity('company_profile_audit_logs')
export class CompanyProfileAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  companyProfileId: string;

  @ManyToOne(() => CompanyProfile, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'companyProfileId' })
  companyProfile: CompanyProfile;

  @Column({ type: 'varchar', length: 100 })
  action: string; // CREATE, UPDATE, DELETE, EXPORT, IMPORT

  @Column({ type: 'varchar', length: 255 })
  fieldChanged: string;

  @Column({ type: 'text', nullable: true })
  oldValue: string;

  @Column({ type: 'text', nullable: true })
  newValue: string;

  @Column({ type: 'varchar', length: 255 })
  changedBy: string; // User ID or username

  @Column({ type: 'varchar', length: 50 })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
