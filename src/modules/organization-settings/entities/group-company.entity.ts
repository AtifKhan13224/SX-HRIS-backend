import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('group_companies')
export class GroupCompany {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  groupCompanyName: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  groupCompanyCode: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  groupCompanyShortName: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  companyWebsiteUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  orgViewDeptGroupingLabel: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  country: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  area: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  timezone: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  defaultDisplayTimezone: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  defaultDatePreference: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  defaultTimeFormat: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  defaultCurrency: string;

  @Column({ type: 'text', nullable: true })
  companyLogo: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  systemStandardElementColor: string;

  @Column({ type: 'text', nullable: true })
  systemTopHeaderColor: string;

  @Column({ type: 'varchar', length: 50, default: 'private' })
  companyType: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  industrySector: string;

  @Column({ type: 'text', nullable: true })
  aboutCompany: string;

  @Column({ type: 'date', nullable: true })
  dateOfIncorporation: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  federalReserveBankID: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  employerID: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  registrationNumber: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  taxIdentificationNumber: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  businessAddress: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
