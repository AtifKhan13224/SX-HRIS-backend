import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { SystemRole } from '../entities/system-role.entity';
import { SystemRoleVersion } from '../entities/system-role-version.entity';
import { CreateSystemRoleDto, UpdateSystemRoleDto, AssignSystemRoleDto, RevokeSystemRoleDto } from '../dto/system-role.dto';
import { AuditService } from './audit.service';
import { SoDEngine } from './sod-engine.service';

@Injectable()
export class SystemRoleService {
  constructor(
    @InjectRepository(SystemRole)
    private readonly systemRoleRepository: Repository<SystemRole>,
    @InjectRepository(SystemRoleVersion)
    private readonly versionRepository: Repository<SystemRoleVersion>,
    private readonly auditService: AuditService,
    private readonly sodEngine: SoDEngine,
  ) {}

  async createSystemRole(createDto: CreateSystemRoleDto): Promise<SystemRole> {
    // Check if role code already exists
    const existing = await this.systemRoleRepository.findOne({
      where: { roleCode: createDto.roleCode }
    });

    if (existing) {
      throw new ConflictException(`Role with code ${createDto.roleCode} already exists`);
    }

    // Create role
    const role = this.systemRoleRepository.create({
      ...createDto,
      version: 1,
      isActive: true,
      currentAssignments: 0,
      systemLocked: true, // System roles are locked by default
    });

    const savedRole = await this.systemRoleRepository.save(role);

    // Create version snapshot
    await this.createVersionSnapshot(savedRole, 'CREATED', createDto.createdBy, 'Initial role creation');

    // Audit log
    await this.auditService.log({
      tenantId: createDto.tenantId,
      userId: createDto.createdBy,
      eventType: 'CONFIGURATION_CHANGE' as any,
      severity: 'HIGH' as any,
      eventDescription: `Created system role: ${createDto.roleName}`,
      roleId: savedRole.id,
      roleCode: savedRole.roleCode,
    });

    return savedRole;
  }

  async updateSystemRole(roleId: string, updateDto: UpdateSystemRoleDto): Promise<SystemRole> {
    const role = await this.findById(roleId);

    if (role.systemLocked && !updateDto.modifiedBy) {
      throw new BadRequestException('System-locked roles require proper authorization and justification');
    }

    // Store old values for audit
    const oldSnapshot = { ...role };

    // Update role
    Object.assign(role, updateDto);
    role.version += 1;
    role.lastModifiedAt = new Date();
    role.lastModifiedBy = updateDto.modifiedBy;
    role.modificationReason = updateDto.modificationReason;

    const updatedRole = await this.systemRoleRepository.save(role);

    // Create version snapshot
    await this.createVersionSnapshot(
      updatedRole,
      'UPDATED',
      updateDto.modifiedBy,
      updateDto.modificationReason
    );

    // Audit log
    await this.auditService.log({
      tenantId: role.tenantId,
      userId: updateDto.modifiedBy,
      eventType: 'CONFIGURATION_CHANGE' as any,
      severity: (role.privilegedRole ? 'CRITICAL' : 'HIGH') as any,
      eventDescription: `Updated system role: ${role.roleName}`,
      roleId: role.id,
      roleCode: role.roleCode,
      oldValue: JSON.stringify(oldSnapshot),
      newValue: JSON.stringify(updatedRole),
    });

    return updatedRole;
  }

  async findById(roleId: string): Promise<SystemRole> {
    const role = await this.systemRoleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions', 'versions'],
    });

    if (!role) {
      throw new NotFoundException(`System role with ID ${roleId} not found`);
    }

    return role;
  }

  async findByCode(roleCode: string): Promise<SystemRole> {
    const role = await this.systemRoleRepository.findOne({
      where: { roleCode },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`System role with code ${roleCode} not found`);
    }

    return role;
  }

  async findAll(tenantId?: string): Promise<SystemRole[]> {
    const where: any = { isActive: true };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    return this.systemRoleRepository.find({
      where,
      relations: ['permissions'],
      order: { displayOrder: 'ASC', roleName: 'ASC' },
    });
  }

  async findByCategory(roleCategory: string, tenantId?: string): Promise<SystemRole[]> {
    const where: any = { roleCategory, isActive: true };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    return this.systemRoleRepository.find({
      where,
      order: { displayOrder: 'ASC' },
    });
  }

  async assignRole(assignDto: AssignSystemRoleDto): Promise<any> {
    const role = await this.findById(assignDto.roleId);

    // Check max assignments
    if (role.maxAssignments > 0 && role.currentAssignments >= role.maxAssignments) {
      throw new BadRequestException(`Maximum assignments (${role.maxAssignments}) reached for role ${role.roleName}`);
    }

    // Check SoD violations
    const sodViolations = await this.sodEngine.checkViolations(assignDto.userId, [assignDto.roleId]);
    if (sodViolations.hasViolations && sodViolations.blockingViolations.length > 0) {
      throw new BadRequestException({
        message: 'Segregation of Duties violation detected',
        violations: sodViolations.blockingViolations,
      });
    }

    // Increment assignment count
    role.currentAssignments += 1;
    await this.systemRoleRepository.save(role);

    // Audit log
    await this.auditService.log({
      tenantId: role.tenantId,
      userId: assignDto.assignedBy,
      eventType: 'ROLE_ASSIGNED' as any,
      severity: (role.privilegedRole ? 'CRITICAL' : 'MEDIUM') as any,
      eventDescription: `Assigned role ${role.roleName} to user ${assignDto.userId}`,
      roleId: role.id,
      roleCode: role.roleCode,
      entityType: 'USER',
      entityId: assignDto.userId,
      contextData: { justification: assignDto.justification },
    });

    return {
      success: true,
      roleId: role.id,
      userId: assignDto.userId,
      sodWarnings: sodViolations.warnings,
    };
  }

  async revokeRole(revokeDto: RevokeSystemRoleDto): Promise<any> {
    const role = await this.findById(revokeDto.roleId);

    // Decrement assignment count
    if (role.currentAssignments > 0) {
      role.currentAssignments -= 1;
      await this.systemRoleRepository.save(role);
    }

    // Audit log
    await this.auditService.log({
      tenantId: role.tenantId,
      userId: revokeDto.revokedBy,
      eventType: 'ROLE_REVOKED' as any,
      severity: 'MEDIUM' as any,
      eventDescription: `Revoked role ${role.roleName} from user ${revokeDto.userId}`,
      roleId: role.id,
      roleCode: role.roleCode,
      entityType: 'USER',
      entityId: revokeDto.userId,
      contextData: { reason: revokeDto.reason },
    });

    return {
      success: true,
      roleId: role.id,
      userId: revokeDto.userId,
    };
  }

  async getRoleVersions(roleId: string): Promise<SystemRoleVersion[]> {
    return this.versionRepository.find({
      where: { systemRoleId: roleId },
      order: { versionNumber: 'DESC' },
    });
  }

  async rollbackToVersion(roleId: string, versionId: string, rolledBackBy: string): Promise<SystemRole> {
    const role = await this.findById(roleId);
    const targetVersion = await this.versionRepository.findOne({
      where: { id: versionId, systemRoleId: roleId },
    });

    if (!targetVersion) {
      throw new NotFoundException('Version not found');
    }

    // Restore from snapshot
    const restoredData = targetVersion.snapshotData;
    Object.assign(role, restoredData);
    role.version += 1;
    role.lastModifiedAt = new Date();
    role.lastModifiedBy = rolledBackBy;
    role.modificationReason = `Rolled back to version ${targetVersion.versionNumber}`;

    const savedRole = await this.systemRoleRepository.save(role);

    // Create rollback version
    await this.createVersionSnapshot(
      savedRole,
      'UPDATED',
      rolledBackBy,
      `Rolled back to version ${targetVersion.versionNumber}`,
      true,
      versionId
    );

    // Audit log
    await this.auditService.log({
      tenantId: role.tenantId,
      userId: rolledBackBy,
      eventType: 'CONFIGURATION_CHANGE' as any,
      severity: 'CRITICAL' as any,
      eventDescription: `Rolled back role ${role.roleName} to version ${targetVersion.versionNumber}`,
      roleId: role.id,
      roleCode: role.roleCode,
    });

    return savedRole;
  }

  private async createVersionSnapshot(
    role: SystemRole,
    changeType: string,
    changedBy: string,
    reason: string,
    isRollback: boolean = false,
    rollbackFromVersionId?: string
  ): Promise<SystemRoleVersion> {
    const version = this.versionRepository.create({
      systemRoleId: role.id,
      versionNumber: role.version,
      changeType: changeType as any,
      snapshotData: { ...role },
      permissionsSnapshot: role.permissions?.map(p => ({
        permissionCode: (p as any).permissionCode,
        grantType: (p as any).grantType,
        dataScopeConfigId: (p as any).dataScopeConfigId,
      })),
      changeReason: reason,
      changedBy,
      isRollbackVersion: isRollback,
      rollbackFromVersionId,
    });

    return this.versionRepository.save(version);
  }

  async getPrivilegedRoles(tenantId?: string): Promise<SystemRole[]> {
    const where: any = { privilegedRole: true, isActive: true };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    return this.systemRoleRepository.find({ where });
  }

  async getBreakGlassRoles(tenantId?: string): Promise<SystemRole[]> {
    const where: any = { breakGlassRole: true, isActive: true };
    if (tenantId) {
      where.tenantId = tenantId;
    }

    return this.systemRoleRepository.find({ where });
  }
}
