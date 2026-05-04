import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RecruitmentSource } from './recruitment-source.entity';

@Entity('candidates')
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Personal Information
  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ length: 100, nullable: true })
  middleName: string;

  @Column({ length: 200, unique: true })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 20, nullable: true })
  alternatePhone: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ length: 20, nullable: true })
  gender: string;

  @Column({ length: 50, nullable: true })
  nationality: string;

  // Address
  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  state: string;

  @Column({ length: 100, nullable: true })
  country: string;

  @Column({ length: 20, nullable: true })
  postalCode: string;

  // Professional Information
  @Column({ nullable: true })
  totalExperience: number; // in years

  @Column({ length: 100, nullable: true })
  currentJobTitle: string;

  @Column({ length: 200, nullable: true })
  currentCompany: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  currentSalary: number;

  @Column({ length: 20, nullable: true })
  salaryCurrency: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  expectedSalary: number;

  @Column({ nullable: true })
  noticePeriod: number; // in days

  @Column({ length: 100, nullable: true })
  highestDegree: string;

  @Column({ length: 200, nullable: true })
  university: string;

  @Column({ nullable: true })
  graduationYear: number;

  @Column({ type: 'text', nullable: true })
  skills: string;

  @Column({ type: 'text', nullable: true })
  certifications: string;

  @Column({ type: 'text', nullable: true })
  languages: string;

  // Source Information
  @Column({ name: 'source_id', nullable: true })
  sourceId: string;

  @ManyToOne(() => RecruitmentSource)
  @JoinColumn({ name: 'source_id' })
  source: RecruitmentSource;

  @Column({ length: 100, nullable: true })
  sourceDetail: string; // e.g., referrer name, campaign name

  @Column({ nullable: true })
  referredBy: string; // Employee ID if referred

  // Documents
  @Column({ length: 500, nullable: true })
  resumePath: string;

  @Column({ length: 500, nullable: true })
  coverLetterPath: string;

  @Column({ type: 'simple-array', nullable: true })
  documentPaths: string[];

  // Social Media
  @Column({ length: 200, nullable: true })
  linkedInUrl: string;

  @Column({ length: 200, nullable: true })
  githubUrl: string;

  @Column({ length: 200, nullable: true })
  portfolioUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  socialMediaLinks: any;

  // Status & Tags
  @Column({ length: 50 })
  status: string; // New, Active, Hired, Rejected, Withdrawn, On Hold, Blacklisted

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isBlacklisted: boolean;

  @Column({ type: 'text', nullable: true })
  blacklistReason: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ nullable: true })
  rating: number; // 1-5 star rating

  @Column({ type: 'text', nullable: true })
  internalNotes: string;

  // Consent & GDPR
  @Column({ default: false })
  dataProcessingConsent: boolean;

  @Column({ type: 'date', nullable: true })
  consentDate: Date;

  @Column({ default: false })
  marketingConsent: boolean;

  // Statistics
  @Column({ default: 0 })
  totalApplications: number;

  @Column({ default: 0 })
  totalInterviews: number;

  @Column({ default: 0 })
  totalOffersReceived: number;

  @Column({ type: 'date', nullable: true })
  lastActivityDate: Date;

  @Column({ type: 'date', nullable: true })
  lastContactDate: Date;

  // Availability
  @Column({ type: 'date', nullable: true })
  availableFrom: Date;

  @Column({ default: false })
  immediateJoiner: boolean;

  @Column({ type: 'simple-array', nullable: true })
  preferredLocations: string[];

  @Column({ type: 'simple-array', nullable: true })
  preferredWorkModes: string[]; // Remote, Hybrid, On-Site

  // Custom Fields
  @Column({ type: 'jsonb', nullable: true })
  customFields: any;

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
