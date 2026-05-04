import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RBACSeederService } from '../services/rbac-seeder.service';

@Controller('organization-settings/rbac/seed')
export class RBACSeederController {
  constructor(private readonly seederService: RBACSeederService) {}

  /**
   * Seed RBAC data (permissions, templates, sample roles)
   * POST /organization-settings/rbac/seed
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async seed() {
    const result = await this.seederService.seed();
    return {
      success: true,
      message: 'RBAC data seeded successfully',
      data: result,
    };
  }

  /**
   * Reset and re-seed RBAC data
   * POST /organization-settings/rbac/seed/reset
   */
  @Post('reset')
  @HttpCode(HttpStatus.OK)
  async resetAndSeed() {
    await this.seederService.reset();
    const result = await this.seederService.seed();
    return {
      success: true,
      message: 'RBAC data reset and re-seeded successfully',
      data: result,
    };
  }
}
