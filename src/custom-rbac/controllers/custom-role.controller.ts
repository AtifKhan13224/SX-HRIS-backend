import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { CustomRoleService } from '../services/custom-role.service';
import {
  CreateCustomRoleDto,
  UpdateCustomRoleDto,
  CustomRoleListQueryDto,
  CustomRoleResponseDto
} from '../dto/custom-role.dto';

// Placeholder auth guard - replace with your actual auth
// @UseGuards(JwtAuthGuard, TenantGuard)
@Controller('api/v1/rbac/custom-roles')
export class CustomRoleController {
  constructor(private readonly customRoleService: CustomRoleService) {}

  /**
   * Create a new custom role
   * POST /api/v1/rbac/custom-roles
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateCustomRoleDto,
    @Request() req: any
  ) {
    const tenantId = req.user?.tenantId || 'default-tenant';
    const userId = req.user?.id || 'system';

    const role = await this.customRoleService.create(createDto, tenantId, userId);

    return {
      success: true,
      message: 'Custom role created successfully',
      data: role
    };
  }

  /**
   * Get all custom roles with filtering and pagination
   * GET /api/v1/rbac/custom-roles
   */
  @Get()
  async findAll(
    @Query() query: CustomRoleListQueryDto,
    @Request() req: any
  ) {
    const tenantId = req.user?.tenantId || 'default-tenant';

    const result = await this.customRoleService.findAll(query, tenantId);

    return {
      success: true,
      ...result
    };
  }

  /**
   * Get a custom role by ID
   * GET /api/v1/rbac/custom-roles/:id
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: any
  ) {
    const tenantId = req.user?.tenantId || 'default-tenant';

    const role = await this.customRoleService.findOne(id, tenantId);

    return {
      success: true,
      data: role
    };
  }

  /**
   * Update a custom role
   * PUT /api/v1/rbac/custom-roles/:id
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCustomRoleDto,
    @Request() req: any
  ) {
    const tenantId = req.user?.tenantId || 'default-tenant';
    const userId = req.user?.id || 'system';

    const role = await this.customRoleService.update(id, updateDto, tenantId, userId);

    return {
      success: true,
      message: 'Custom role updated successfully',
      data: role
    };
  }

  /**
   * Delete a custom role
   * DELETE /api/v1/rbac/custom-roles/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Request() req: any
  ) {
    const tenantId = req.user?.tenantId || 'default-tenant';

    await this.customRoleService.remove(id, tenantId);
  }

  /**
   * Deactivate a custom role
   * POST /api/v1/rbac/custom-roles/:id/deactivate
   */
  @Post(':id/deactivate')
  async deactivate(
    @Param('id') id: string,
    @Request() req: any
  ) {
    const tenantId = req.user?.tenantId || 'default-tenant';
    const userId = req.user?.id || 'system';

    const role = await this.customRoleService.deactivate(id, tenantId, userId);

    return {
      success: true,
      message: 'Custom role deactivated successfully',
      data: role
    };
  }

  /**
   * Get effective permissions for a role
   * GET /api/v1/rbac/custom-roles/:id/effective-permissions
   */
  @Get(':id/effective-permissions')
  async getEffectivePermissions(
    @Param('id') id: string,
    @Request() req: any
  ) {
    const tenantId = req.user?.tenantId || 'default-tenant';

    const permissions = await this.customRoleService.getEffectivePermissions(id, tenantId);

    return {
      success: true,
      data: permissions
    };
  }

  /**
   * Get inheritance tree for a role
   * GET /api/v1/rbac/custom-roles/:id/inheritance-tree
   */
  @Get(':id/inheritance-tree')
  async getInheritanceTree(
    @Param('id') id: string,
    @Request() req: any
  ) {
    const tenantId = req.user?.tenantId || 'default-tenant';

    const tree = await this.customRoleService.getInheritanceTree(id, tenantId);

    return {
      success: true,
      data: tree
    };
  }

  /**
   * Validate role for SoD violations
   * POST /api/v1/rbac/custom-roles/:id/validate
   */
  @Post(':id/validate')
  async validateRole(
    @Param('id') id: string,
    @Request() req: any
  ) {
    const tenantId = req.user?.tenantId || 'default-tenant';

    const validation = await this.customRoleService.validateRole(id, tenantId);

    return {
      success: true,
      data: validation
    };
  }

  /**
   * Get risk score for a role
   * GET /api/v1/rbac/custom-roles/:id/risk-score
   */
  @Get(':id/risk-score')
  async getRiskScore(
    @Param('id') id: string,
    @Request() req: any
  ) {
    const tenantId = req.user?.tenantId || 'default-tenant';

    const riskScore = await this.customRoleService.getRiskScore(id, tenantId);

    return {
      success: true,
      data: riskScore
    };
  }

  /**
   * Simulate role changes
   * POST /api/v1/rbac/custom-roles/:id/simulate
   */
  @Post(':id/simulate')
  async simulate(
    @Param('id') id: string,
    @Body() changes: any,
    @Request() req: any
  ) {
    const tenantId = req.user?.tenantId || 'default-tenant';

    const simulation = await this.customRoleService.simulate(id, tenantId, changes);

    return {
      success: true,
      data: simulation
    };
  }

  /**
   * Clone a role
   * POST /api/v1/rbac/custom-roles/:id/clone
   */
  @Post(':id/clone')
  async clone(
    @Param('id') id: string,
    @Body() body: { roleCode: string; roleName: string },
    @Request() req: any
  ) {
    const tenantId = req.user?.tenantId || 'default-tenant';
    const userId = req.user?.id || 'system';

    const cloned = await this.customRoleService.clone(
      id,
      body.roleCode,
      body.roleName,
      tenantId,
      userId
    );

    return {
      success: true,
      message: 'Role cloned successfully',
      data: cloned
    };
  }

  /**
   * Get role statistics
   * GET /api/v1/rbac/custom-roles/statistics
   */
  @Get('statistics/summary')
  async getStatistics(@Request() req: any) {
    const tenantId = req.user?.tenantId || 'default-tenant';

    const stats = await this.customRoleService.getStatistics(tenantId);

    return {
      success: true,
      data: stats
    };
  }
}
