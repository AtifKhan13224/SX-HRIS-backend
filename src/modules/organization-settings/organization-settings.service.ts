import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyProfile } from './entities/company-profile.entity';
import { CompanyProfileAuditLog } from './entities/company-profile-audit.entity';
import { CreateCompanyProfileDto } from './dto/create-company-profile.dto';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';

interface AuditContext {
  userId: string;
  ipAddress: string;
  userAgent: string;
}

@Injectable()
export class OrganizationSettingsService {
  constructor(
    @InjectRepository(CompanyProfile)
    private companyProfileRepository: Repository<CompanyProfile>,
    @InjectRepository(CompanyProfileAuditLog)
    private auditLogRepository: Repository<CompanyProfileAuditLog>,
  ) {}

  async getCompanyProfile(): Promise<CompanyProfile> {
    // Get the first (and should be only) company profile
    const profile = await this.companyProfileRepository.findOne({
      where: {},
      order: { createdAt: 'ASC' },
    });

    if (!profile) {
      // Create default profile if none exists
      return this.createDefaultProfile();
    }

    return profile;
  }

  async updateCompanyProfile(
    updateDto: UpdateCompanyProfileDto,
    context?: AuditContext,
  ): Promise<CompanyProfile> {
    const profile = await this.getCompanyProfile();
    const oldProfile = { ...profile };
    
    // Track changes for audit log
    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];
    
    Object.keys(updateDto).forEach((key) => {
      if (updateDto[key] !== undefined && profile[key] !== updateDto[key]) {
        changes.push({
          field: key,
          oldValue: profile[key],
          newValue: updateDto[key],
        });
      }
    });
    
    Object.assign(profile, updateDto);
    const savedProfile = await this.companyProfileRepository.save(profile);
    
    // Log changes
    if (context && changes.length > 0) {
      await this.logChanges(profile.id, changes, 'UPDATE', context);
    }
    
    return savedProfile;
  }

  async uploadLogo(logoData: string, context?: AuditContext): Promise<CompanyProfile> {
    const profile = await this.getCompanyProfile();
    const oldLogo = profile.companyLogo;
    profile.companyLogo = logoData;
    const saved = await this.companyProfileRepository.save(profile);
    
    if (context) {
      await this.createAuditLog({
        companyProfileId: profile.id,
        action: 'UPDATE',
        fieldChanged: 'companyLogo',
        oldValue: oldLogo ? 'Logo present' : 'No logo',
        newValue: 'Logo uploaded',
        changedBy: context.userId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
    }
    
    return saved;
  }

  async uploadBackground(backgroundData: string, context?: AuditContext): Promise<CompanyProfile> {
    const profile = await this.getCompanyProfile();
    const oldBg = profile.loginPageBackground;
    profile.loginPageBackground = backgroundData;
    const saved = await this.companyProfileRepository.save(profile);
    
    if (context) {
      await this.createAuditLog({
        companyProfileId: profile.id,
        action: 'UPDATE',
        fieldChanged: 'loginPageBackground',
        oldValue: oldBg ? 'Background present' : 'No background',
        newValue: 'Background uploaded',
        changedBy: context.userId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
    }
    
    return saved;
  }

  async deleteLogo(context?: AuditContext): Promise<CompanyProfile> {
    const profile = await this.getCompanyProfile();
    profile.companyLogo = null;
    const saved = await this.companyProfileRepository.save(profile);
    
    if (context) {
      await this.createAuditLog({
        companyProfileId: profile.id,
        action: 'DELETE',
        fieldChanged: 'companyLogo',
        oldValue: 'Logo present',
        newValue: null,
        changedBy: context.userId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
    }
    
    return saved;
  }

  async deleteBackground(context?: AuditContext): Promise<CompanyProfile> {
    const profile = await this.getCompanyProfile();
    profile.loginPageBackground = null;
    const saved = await this.companyProfileRepository.save(profile);
    
    if (context) {
      await this.createAuditLog({
        companyProfileId: profile.id,
        action: 'DELETE',
        fieldChanged: 'loginPageBackground',
        oldValue: 'Background present',
        newValue: null,
        changedBy: context.userId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
    }
    
    return saved;
  }

  private async createDefaultProfile(): Promise<CompanyProfile> {
    const defaultProfile = this.companyProfileRepository.create({
      companyName: '',
      companyCode: '',
      companySubdomain: '',
      country: '',
      state: '',
      city: '',
      area: '',
      defaultCurrency: 'USD',
      companyTimezone: '(UTC-08:00) America/Los_Angeles',
      tenantTimezone: '(UTC-08:00) America/Los_Angeles',
      defaultDisplayTimezone: '(UTC-08:00) America/Los_Angeles',
      defaultDatePreference: 'MM/DD/YYYY',
      defaultTimeFormat: '12-hour',
      baseCurrency: 'USD',
      financialYearBeginsIn: 'January',
      companyType: 'private',
      industrySector: 'Other',
      dynamicLogoBackground: false,
      dynamicHeaderContrast: false,
      sortL3Alphabetically: false,
      systemStandardElementColor: '#4F46E5',
      fontColorCareerPageHeader: '#7C3AED',
      browserTabTitle: 'HRIS',
    });

    return this.companyProfileRepository.save(defaultProfile);
  }

  // Audit Log Methods
  private async logChanges(
    profileId: string,
    changes: Array<{ field: string; oldValue: any; newValue: any }>,
    action: string,
    context: AuditContext,
  ): Promise<void> {
    const logs = changes.map((change) => ({
      companyProfileId: profileId,
      action,
      fieldChanged: change.field,
      oldValue: this.sanitizeValue(change.oldValue),
      newValue: this.sanitizeValue(change.newValue),
      changedBy: context.userId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    }));

    await this.auditLogRepository.save(logs);
  }

  private async createAuditLog(data: Partial<CompanyProfileAuditLog>): Promise<void> {
    await this.auditLogRepository.save(data);
  }

  private sanitizeValue(value: any): string {
    if (value === null || value === undefined) return null;
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'string' && value.length > 1000) {
      return value.substring(0, 1000) + '... (truncated)';
    }
    return String(value);
  }

  async getAuditLogs(profileId?: string, limit = 100): Promise<CompanyProfileAuditLog[]> {
    const query = this.auditLogRepository
      .createQueryBuilder('audit')
      .orderBy('audit.createdAt', 'DESC')
      .take(limit);

    if (profileId) {
      query.where('audit.companyProfileId = :profileId', { profileId });
    }

    return query.getMany();
  }

  // Import/Export Methods
  async exportProfile(): Promise<any> {
    const profile = await this.getCompanyProfile();
    
    // Remove sensitive fields and metadata
    const { id, createdAt, updatedAt, ...exportData } = profile;
    
    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      data: exportData,
    };
  }

  async importProfile(
    importData: any,
    context?: AuditContext,
  ): Promise<CompanyProfile> {
    if (!importData || !importData.data) {
      throw new BadRequestException('Invalid import data format');
    }

    const profile = await this.getCompanyProfile();
    const oldProfile = { ...profile };

    // Validate and sanitize import data
    const validatedData = this.validateImportData(importData.data);
    
    Object.assign(profile, validatedData);
    const saved = await this.companyProfileRepository.save(profile);

    if (context) {
      await this.createAuditLog({
        companyProfileId: profile.id,
        action: 'IMPORT',
        fieldChanged: 'All Fields',
        oldValue: 'Previous configuration',
        newValue: 'Imported configuration',
        changedBy: context.userId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        notes: `Imported from version ${importData.version || 'unknown'}`,
      });
    }

    return saved;
  }

  private validateImportData(data: any): Partial<CompanyProfile> {
    const allowedFields = [
      'companyName', 'companyCode', 'companyWebsiteURL', 'groupCompanyShortName',
      'companySubdomain', 'orgViewDeptGroupingLabel', 'permittedEmailDomains',
      'country', 'state', 'city', 'area', 'defaultCurrency', 'companyTimezone',
      'tenantTimezone', 'defaultDisplayTimezone', 'defaultDatePreference',
      'defaultTimeFormat', 'baseCurrency', 'financialYearBeginsIn',
      'companyType', 'industrySector', 'aboutCompany', 'dateOfIncorporation',
      'federalReserveBankID', 'fedReserveBankDistrict', 'employerID',
      'eeoCompanyCode', 'dynamicLogoBackground', 'dynamicHeaderContrast',
      'sortL3Alphabetically', 'postLoginLandingPage', 'systemTopHeaderColor',
      'systemStandardElementColor', 'fontColorCareerPageHeader', 'browserTabTitle',
    ];

    const validated: any = {};
    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        validated[field] = data[field];
      }
    });

    return validated;
  }

  async getCategories() {
    return {
      categories: [
        {
          id: 'units',
          title: 'Organization Units',
          description: 'Manage company structure and organizational hierarchy',
          itemCount: 6,
        },
        {
          id: 'roles-career',
          title: 'Roles & Career',
          description: 'Configure roles, designations, and career path structures',
          itemCount: 12,
        },
        {
          id: 'locations',
          title: 'Locations',
          description: 'Manage office locations, regions, and address structures',
          itemCount: 7,
        },
        {
          id: 'rbac',
          title: 'Role Based Access Controls',
          description: 'Manage permissions, roles, and access controls',
          itemCount: 3,
        },
        {
          id: 'employee-data',
          title: 'Employee Data',
          description: 'Configure employee data structures and profiles',
          itemCount: 11,
        },
        {
          id: 'employment-mgmt',
          title: 'Employment Management',
          description: 'Manage employment types and numbering schemes',
          itemCount: 3,
        },
        {
          id: 'lifecycle',
          title: 'Lifecycle Management',
          description: 'Manage employee lifecycle events and periods',
          itemCount: 7,
        },
        {
          id: 'projects',
          title: 'Project Management',
          description: 'Manage projects, activities, and roles',
          itemCount: 5,
        },
        {
          id: 'spend',
          title: 'Spend Tracking',
          description: 'Configure cost centers and financial tracking',
          itemCount: 2,
        },
      ],
    };
  }

  // Multiple Company Profiles Management
  async getAllCompanyProfiles(): Promise<CompanyProfile[]> {
    return this.companyProfileRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getCompanyProfileById(id: string): Promise<CompanyProfile> {
    const profile = await this.companyProfileRepository.findOne({
      where: { id },
    });

    if (!profile) {
      throw new NotFoundException(`Company profile with ID ${id} not found`);
    }

    return profile;
  }

  async createCompanyProfile(
    createDto: CreateCompanyProfileDto,
    context?: AuditContext,
  ): Promise<CompanyProfile> {
    const profile = this.companyProfileRepository.create(createDto);
    const saved = await this.companyProfileRepository.save(profile);

    if (context) {
      await this.createAuditLog({
        companyProfileId: saved.id,
        action: 'CREATE',
        fieldChanged: 'All Fields',
        oldValue: null,
        newValue: 'New profile created',
        changedBy: context.userId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        notes: `Created profile: ${saved.companyName}`,
      });
    }

    return saved;
  }

  async updateCompanyProfileById(
    id: string,
    updateDto: UpdateCompanyProfileDto,
    context?: AuditContext,
  ): Promise<CompanyProfile> {
    const profile = await this.getCompanyProfileById(id);
    
    // Track changes for audit log
    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];
    
    Object.keys(updateDto).forEach((key) => {
      if (updateDto[key] !== undefined && profile[key] !== updateDto[key]) {
        changes.push({
          field: key,
          oldValue: profile[key],
          newValue: updateDto[key],
        });
      }
    });
    
    Object.assign(profile, updateDto);
    const savedProfile = await this.companyProfileRepository.save(profile);
    
    // Log changes
    if (context && changes.length > 0) {
      await this.logChanges(profile.id, changes, 'UPDATE', context);
    }
    
    return savedProfile;
  }

  async deleteCompanyProfile(
    id: string,
    context?: AuditContext,
  ): Promise<void> {
    const profile = await this.getCompanyProfileById(id);

    if (context) {
      await this.createAuditLog({
        companyProfileId: id,
        action: 'DELETE',
        fieldChanged: 'All Fields',
        oldValue: `Profile: ${profile.companyName}`,
        newValue: null,
        changedBy: context.userId,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        notes: `Deleted profile: ${profile.companyName}`,
      });
    }

    await this.companyProfileRepository.remove(profile);
  }
}
