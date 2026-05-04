import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  TEMPORARY = 'temporary',
  INTERNSHIP = 'internship',
}

export enum EmploymentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
  TERMINATED = 'terminated',
  SUSPENDED = 'suspended',
}

@Entity('employee')
@Index('idx_employee_user_id', ['userId'])
@Index('idx_employee_department_id', ['departmentId'])
@Index('idx_employee_email', ['email'])
@Index('idx_employee_employee_id', ['employeeId'])
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  employeeId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  zipCode: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  gender: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  emergencyContact: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  emergencyPhone: string;

  // Employment Information
  @Column({ type: 'uuid', nullable: true })
  departmentId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  designation: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  position: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  manager: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reportingManager: string;

  @Column({ type: 'enum', enum: EmploymentType, default: EmploymentType.FULL_TIME })
  employmentType: EmploymentType;

  @Column({ type: 'enum', enum: EmploymentStatus, default: EmploymentStatus.ACTIVE })
  employmentStatus: EmploymentStatus;

  @Column({ type: 'varchar', length: 50, nullable: true })
  employeeCategory: string;

  @Column({ type: 'date' })
  hireDate: Date;

  @Column({ type: 'date', nullable: true })
  contractEndDate: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  workLocation: string;

  // Salary Information
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  baseSalary: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  currency: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  salaryFrequency: string;

  // Bank Information
  @Column({ type: 'varchar', length: 100, nullable: true })
  bankName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  accountNumber: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  routingNumber: string;

  // Document Information
  @Column({ type: 'varchar', length: 100, nullable: true })
  nationalId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  passportNumber: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  photoUrl: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bloodGroup: string;

  // Visa & Immigration Information
  @Column({ type: 'varchar', length: 100, nullable: true })
  visaNumber: string;

  @Column({ type: 'date', nullable: true })
  visaExpiryDate: Date;

  @Column({ type: 'varchar', length: 200, nullable: true })
  sponsoringCompany: string;

  @Column({ type: 'date', nullable: true })
  missionStartDate: Date;

  @Column({ type: 'date', nullable: true })
  missionEndDate: Date;

  // Termination Information
  @Column({ type: 'date', nullable: true })
  terminationDate: Date;

  @Column({ type: 'text', nullable: true })
  terminationReason: string;

  // Additional Information
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
