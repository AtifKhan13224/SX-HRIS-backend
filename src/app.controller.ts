import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Welcome message' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint for monitoring' })
  health(): {
    status: string;
    timestamp: string;
    uptime: number;
    environment: string;
    version: string;
    memory: {
      used: string;
      total: string;
      free: string;
    };
  } {
    return this.appService.health();
  }
}
