import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly startTime: Date;

  constructor() {
    this.startTime = new Date();
  }

  getHello(): string {
    return 'Welcome to SX-HRIS Backend API';
  }

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
    const memoryUsage = process.memoryUsage();
    const uptime = Math.floor((new Date().getTime() - this.startTime.getTime()) / 1000);

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime, // seconds since start
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      memory: {
        used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        free: `${Math.round((memoryUsage.heapTotal - memoryUsage.heapUsed) / 1024 / 1024)} MB`,
      },
    };
  }
}
