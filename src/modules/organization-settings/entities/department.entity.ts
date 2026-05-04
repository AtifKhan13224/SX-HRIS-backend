import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Division } from './division.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'department_name', type: 'varchar', length: 255 })
  departmentName: string;

  @Column({ name: 'department_code', type: 'varchar', length: 100, unique: true })
  departmentCode: string;

  @Column({ name: 'department_description', type: 'text', nullable: true })
  departmentDescription: string;

  @Column({ name: 'department_email', type: 'varchar', length: 255, nullable: true })
  departmentEmail: string;

  // Parent Division (many departments belong to one division)
  @Column({ name: 'parent_division_id', type: 'uuid', nullable: true })
  parentDivisionId: string;

  @ManyToOne(() => Division, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_division_id' })
  parentDivision: Division;

  // Self-referencing for department hierarchy
  @Column({ name: 'parent_department_id', type: 'uuid', nullable: true })
  parentDepartmentId: string;

  @ManyToOne(() => Department, (department) => department.subDepartments, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_department_id' })
  parentDepartment: Department;

  @OneToMany(() => Department, (department) => department.parentDepartment)
  subDepartments: Department[];

  // Top Department (root of hierarchy)
  @Column({ name: 'top_department_id', type: 'uuid', nullable: true })
  topDepartmentId: string;

  @ManyToOne(() => Department, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'top_department_id' })
  topDepartment: Department;

  @Column({ name: 'cost_center', type: 'varchar', length: 100, nullable: true })
  costCenter: string;

  @Column({ name: 'capability_id', type: 'uuid', nullable: true })
  capabilityId: string;

  // Personnel
  @Column({ name: 'hod', type: 'varchar', length: 255, nullable: true })
  hod: string; // Head of Department

  @Column({ name: 'functional_head', type: 'varchar', length: 255, nullable: true })
  functionalHead: string;

  @Column({ name: 'head_hr', type: 'varchar', length: 255, nullable: true })
  headHR: string;

  @Column({ name: 'group_hr_head', type: 'varchar', length: 255, nullable: true })
  groupHRHead: string;

  @Column({ name: 'performance_head', type: 'varchar', length: 255, nullable: true })
  performanceHead: string;

  // Location
  @Column({ name: 'country', type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ name: 'state', type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ name: 'city', type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ name: 'address', type: 'text', nullable: true })
  address: string;

  @Column({ name: 'postal_code', type: 'varchar', length: 20, nullable: true })
  postalCode: string;

  // Contact
  @Column({ name: 'phone', type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ name: 'fax', type: 'varchar', length: 50, nullable: true })
  fax: string;

  @Column({ name: 'website', type: 'varchar', length: 255, nullable: true })
  website: string;

  // Metrics
  @Column({ name: 'employee_count', type: 'int', default: 0 })
  employeeCount: number;

  @Column({ name: 'sub_department_count', type: 'int', default: 0 })
  subDepartmentCount: number;

  // Budget
  @Column({ name: 'ot_budget', type: 'decimal', precision: 15, scale: 2, nullable: true })
  otBudget: number;

  @Column({ name: 'budget_currency', type: 'varchar', length: 10, nullable: true })
  budgetCurrency: string;

  @Column({ name: 'annual_budget', type: 'decimal', precision: 15, scale: 2, nullable: true })
  annualBudget: number;

  // Timeline
  @Column({ name: 'established_date', type: 'date', nullable: true })
  establishedDate: Date;

  @Column({ name: 'department_type', type: 'varchar', length: 100, nullable: true })
  departmentType: string; // e.g., Core, Support, Strategic

  @Column({ name: 'functional_area', type: 'varchar', length: 100, nullable: true })
  functionalArea: string; // e.g., HR, Finance, IT, Operations

  // Toggles
  @Column({ name: 'auto_numbering', type: 'boolean', default: false })
  autoNumbering: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_core', type: 'boolean', default: false })
  isCore: boolean; // Core department flag

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
