import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('company_profiles')
export class CompanyProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Basic Details
  @Column({ type: 'varchar', length: 255 })
  companyName: string;

  @Column({ type: 'varchar', length: 100 })
  companyCode: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  companyWebsiteURL: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  groupCompanyShortName: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  companySubdomain: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  orgViewDeptGroupingLabel: string;

  @Column({ type: 'text', nullable: true })
  permittedEmailDomains: string;

  @Column({ type: 'varchar', length: 100 })
  country: string;

  @Column({ type: 'varchar', length: 100 })
  state: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 255 })
  area: string;

  @Column({ type: 'varchar', length: 10 })
  defaultCurrency: string;

  @Column({ type: 'varchar', length: 100 })
  companyTimezone: string;

  @Column({ type: 'varchar', length: 100 })
  tenantTimezone: string;

  @Column({ type: 'varchar', length: 100 })
  defaultDisplayTimezone: string;

  @Column({ type: 'varchar', length: 50 })
  defaultDatePreference: string;

  @Column({ type: 'varchar', length: 50 })
  defaultTimeFormat: string;

  @Column({ type: 'varchar', length: 10 })
  baseCurrency: string;

  @Column({ type: 'text', nullable: true })
  companyLogo: string;

  // Company Details
  @Column({ type: 'varchar', length: 50 })
  financialYearBeginsIn: string;

  @Column({ type: 'varchar', length: 50 })
  companyType: string;

  @Column({ type: 'varchar', length: 100 })
  industrySector: string;

  @Column({ type: 'text', nullable: true })
  aboutCompany: string;

  @Column({ type: 'date', nullable: true })
  dateOfIncorporation: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  federalReserveBankID: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  fedReserveBankDistrict: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  employerID: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  eeoCompanyCode: string;

  // Configure Experience
  @Column({ type: 'boolean', default: true })
  dynamicLogoBackground: boolean;

  @Column({ type: 'boolean', default: true })
  dynamicHeaderContrast: boolean;

  @Column({ type: 'boolean', default: false })
  sortL3Alphabetically: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  postLoginLandingPage: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  systemTopHeaderColor: string;

  @Column({ type: 'text', nullable: true })
  loginPageBackground: string;

  @Column({ type: 'varchar', length: 20, default: '#4F46E5' })
  systemStandardElementColor: string;

  @Column({ type: 'varchar', length: 20, default: '#7C3AED' })
  fontColorCareerPageHeader: string;

  @Column({ type: 'varchar', length: 100, default: 'Parent Company Name' })
  browserTabTitle: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
