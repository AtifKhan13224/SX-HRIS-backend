import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GroupCompany } from './group-company.entity';

@Entity('business_units')
export class BusinessUnit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  businessUnitName: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  businessUnitCode: string;

  @Column({ type: 'text', nullable: true })
  businessUnitAddress: string;

  @Column({ type: 'uuid', nullable: true })
  parentGroupCompanyId: string;

  @ManyToOne(() => GroupCompany, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parentGroupCompanyId' })
  parentGroupCompany: GroupCompany;

  @Column({ type: 'varchar', length: 100, nullable: true })
  costCenter: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  businessUnitHead: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  businessUnitHR: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  country: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  businessType: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  department: string;

  @Column({ type: 'int', default: 0 })
  employeeCount: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  defaultCurrency: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  timezone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  registrationNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  taxIdentificationNumber: string;

  @Column({ type: 'boolean', default: false })
  isHeadquarters: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: true })
  autoNumbering: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
