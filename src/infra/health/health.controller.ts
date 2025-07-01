import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';

import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly healthService: HealthService,
  ) {}

  @Get()
  @HealthCheck()
  @HttpCode(HttpStatus.OK)
  async check() {
    return this.health.check([
      // Database health check
      () => this.healthService.checkDatabaseHealth(),

      // Memory health check
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // 150MB
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024), // 150MB

      // Custom health checks
      () => this.healthService.checkQueueHealth(),
      () => this.healthService.checkEmailService(),
    ]);
  }

  @Get('readiness')
  @HealthCheck()
  @HttpCode(HttpStatus.OK)
  async readiness() {
    return this.health.check([
      () => this.healthService.checkDatabaseHealth(),
      () => this.healthService.checkQueueHealth(),
    ]);
  }

  @Get('liveness')
  @HealthCheck()
  @HttpCode(HttpStatus.OK)
  async liveness() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024), // 200MB
    ]);
  }

  @Get('detailed')
  @HttpCode(HttpStatus.OK)
  async detailedHealth(@Query('includeQueue') includeQueue?: boolean) {
    return await this.healthService.getDetailedHealth(includeQueue);
  }

  @Get('metrics')
  @HttpCode(HttpStatus.OK)
  async metrics() {
    return this.healthService.getMetrics();
  }
}
