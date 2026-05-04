import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BusinessUnit } from './business-unit.entity';

@Entity('division')
export class Division {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  divisionName: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  divisionCode: string;

  @Column({ type: 'text', nullable: true })
  divisionDescription: string;

  @Column({ type: 'uuid', nullable: true })
  parentBusinessUnitId: string;

  @ManyToOne(() => BusinessUnit, { nullable: true, eager: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parentBusinessUnitId' })
  parentBusinessUnit: BusinessUnit;

  @Column({ type: 'varchar', length: 100, nullable: true })
  costCenter: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  divisionHead: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  divisionManager: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  divisionType: string;

  @Column({ type: 'int', default: 0 })
  employeeCount: number;

  @Column({ type: 'int', default: 0 })
  departmentCount: number;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  budgetCurrency: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  annualBudget: number;

  @Column({ type: 'date', nullable: true })
  establishedDate: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  functionalArea: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reportingRegion: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: true })
  autoNumbering: boolean;

  @Column({ type: 'boolean', default: false })
  isStrategic: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
