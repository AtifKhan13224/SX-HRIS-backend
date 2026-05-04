import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportExportControl } from '../entities';

export interface ExportValidation {
  allowed: boolean;
  reason?: string;
  warnings?: string[];
}

interface ExportMetadata {
  format: string;
  rowCount: number;
  userId: string;
  reportId: string;
  justification?: string;
}

@Injectable()
export class ExportControlEngine {
  constructor(
    @InjectRepository(ReportExportControl)
    private exportControlRepo: Repository<ReportExportControl>,
  ) {}

  /**
   * Get export controls for a report and role
   */
  async findExportControls(reportId: string, roleId: string, tenantId: string) {
    return await this.exportControlRepo.findOne({
      where: { reportId, roleId, tenantId, isActive: true },
    });
  }

  /**
   * Create export control rule
   */
  async createExportControl(tenantId: string, userId: string, data: any) {
    const control = this.exportControlRepo.create({
      ...data,
      tenantId,
      createdBy: userId,
    });

    return await this.exportControlRepo.save(control);
  }

  /**
   * Update export control rule
   */
  async updateExportControl(id: string, tenantId: string, userId: string, data: any) {
    const control = await this.exportControlRepo.findOne({
      where: { id, tenantId },
    });

    if (!control) {
      throw new Error('Export control rule not found');
    }

    Object.assign(control, {
      ...data,
      updatedBy: userId,
    });

    return await this.exportControlRepo.save(control);
  }

  /**
   * Delete export control rule
   */
  async deleteExportControl(id: string, tenantId: string) {
    const control = await this.exportControlRepo.findOne({
      where: { id, tenantId },
    });

    if (!control) {
      throw new Error('Export control rule not found');
    }

    control.isActive = false;
    return await this.exportControlRepo.save(control);
  }

  /**
   * Validate export request
   */
  async validateExport(
    reportId: string,
    roleId: string,
    tenantId: string,
    exportMetadata: ExportMetadata,
  ): Promise<ExportValidation> {
    const control = await this.findExportControls(reportId, roleId, tenantId);

    if (!control) {
      // No controls = allowed
      return { allowed: true };
    }

    const warnings: string[] = [];

    // Validate format
    if (!control.allowedFormats.includes(exportMetadata.format.toUpperCase())) {
      return {
        allowed: false,
        reason: `Export format ${exportMetadata.format} not allowed. Allowed formats: ${control.allowedFormats.join(', ')}`,
      };
    }

    // Validate row limit
    if (control.maxRowLimit && exportMetadata.rowCount > control.maxRowLimit) {
      return {
        allowed: false,
        reason: `Row count (${exportMetadata.rowCount}) exceeds maximum allowed (${control.maxRowLimit})`,
      };
    }

    // Check warning threshold
    if (control.warnAtRowCount && exportMetadata.rowCount > control.warnAtRowCount) {
      warnings.push(`Row count (${exportMetadata.rowCount}) exceeds warning threshold (${control.warnAtRowCount})`);
    }

    // Validate justification
    if (control.requiresJustification) {
      if (!exportMetadata.justification) {
        return {
          allowed: false,
          reason: 'Business justification is required for this export',
        };
      }

      if (
        control.justificationMinLength &&
        exportMetadata.justification.length < control.justificationMinLength
      ) {
        return {
          allowed: false,
          reason: `Justification must be at least ${control.justificationMinLength} characters`,
        };
      }
    }

    // Check rate limits
    const rateLimitCheck = await this.checkRateLimits(
      reportId,
      exportMetadata.userId,
      tenantId,
      control,
    );

    if (!rateLimitCheck.allowed) {
      return rateLimitCheck;
    }

    return { allowed: true, warnings: warnings.length > 0 ? warnings : undefined };
  }

  /**
   * Check rate limits for exports
   */
  private async checkRateLimits(
    reportId: string,
    userId: string,
    tenantId: string,
    control: ReportExportControl,
  ): Promise<ExportValidation> {
    // This would query audit logs to count recent exports
    // For now, we'll return a simplified check

    // In a real implementation, you would:
    // 1. Query audit logs for this user/report
    // 2. Count exports in the last day/week/month
    // 3. Compare against limits

    return { allowed: true };
  }

  /**
   * Generate watermark text
   */
  generateWatermark(
    userId: string,
    userEmail: string,
    reportName: string,
    timestamp: Date,
    customTemplate?: string,
  ): string {
    if (customTemplate) {
      return customTemplate
        .replace('{userId}', userId)
        .replace('{userEmail}', userEmail)
        .replace('{reportName}', reportName)
        .replace('{timestamp}', timestamp.toISOString());
    }

    return `CONFIDENTIAL - Exported by ${userEmail} on ${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString()} - ${reportName}`;
  }

  /**
   * Generate secure password
   */
  generateSecurePassword(complexity?: any): string {
    const length = complexity?.minLength || 12;
    const useUppercase = complexity?.requireUppercase !== false;
    const useLowercase = complexity?.requireLowercase !== false;
    const useNumbers = complexity?.requireNumbers !== false;
    const useSpecial = complexity?.requireSpecialChars !== false;

    let chars = '';
    let password = '';

    if (useUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) chars += '0123456789';
    if (useSpecial) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    // Ensure at least one of each required type
    if (useUppercase) password += this.randomChar('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    if (useLowercase) password += this.randomChar('abcdefghijklmnopqrstuvwxyz');
    if (useNumbers) password += this.randomChar('0123456789');
    if (useSpecial) password += this.randomChar('!@#$%^&*');

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += this.randomChar(chars);
    }

    // Shuffle the password
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  private randomChar(chars: string): string {
    return chars.charAt(Math.floor(Math.random() * chars.length));
  }

  /**
   * Calculate file expiry timestamp
   */
  calculateExpiryTimestamp(expiryHours: number): Date {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + expiryHours);
    return expiry;
  }

  /**
   * Validate export destination
   */
  validateDestination(
    destination: string,
    control: ReportExportControl,
  ): { allowed: boolean; reason?: string } {
    // Check if destination is allowed
    if (control.allowedDestinations && control.allowedDestinations.length > 0) {
      const isAllowed = control.allowedDestinations.some(allowed =>
        destination.includes(allowed)
      );

      if (!isAllowed) {
        return {
          allowed: false,
          reason: `Destination not in allowed list: ${control.allowedDestinations.join(', ')}`,
        };
      }
    }

    // Check for blocked destinations
    const lowerDest = destination.toLowerCase();

    if (control.blockExternalEmail && lowerDest.includes('@') && !this.isInternalEmail(lowerDest)) {
      return { allowed: false, reason: 'Export to external email is blocked' };
    }

    if (control.blockCloudStorage && this.isCloudStorage(lowerDest)) {
      return { allowed: false, reason: 'Export to cloud storage is blocked' };
    }

    if (control.blockRemovableMedia && this.isRemovableMedia(lowerDest)) {
      return { allowed: false, reason: 'Export to removable media is blocked' };
    }

    return { allowed: true };
  }

  private isInternalEmail(email: string): boolean {
    // This would check against your organization's domain
    // For now, simplified check
    return email.includes('@company.com') || email.includes('@internal.com');
  }

  private isCloudStorage(path: string): boolean {
    const cloudProviders = [
      'dropbox',
      'google drive',
      'onedrive',
      'box.com',
      's3.amazonaws',
      'azure.blob',
    ];

    return cloudProviders.some(provider => path.toLowerCase().includes(provider));
  }

  private isRemovableMedia(path: string): boolean {
    // Detect removable drive paths (Windows: D:, E:, F:, etc.)
    const removableDrivePattern = /^[D-Z]:/i;
    return removableDrivePattern.test(path);
  }

  /**
   * Get export statistics
   */
  async getExportStatistics(
    reportId: string,
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    // This would query audit logs to get export statistics
    // For now, return placeholder
    return {
      totalExports: 0,
      exportsByFormat: {},
      exportsByUser: {},
      totalRowsExported: 0,
      averageExportSize: 0,
    };
  }
}
