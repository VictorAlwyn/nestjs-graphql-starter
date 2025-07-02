import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';

import { Public } from '../../core/decorators/auth.decorators';

import { HealthService } from './health.service';

@Controller('health')
@Public()
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

      // Memory health check - use much higher thresholds for tests
      () => this.memory.checkHeap('memory_heap', 1000 * 1024 * 1024), // 1GB
      () => this.memory.checkRSS('memory_rss', 1000 * 1024 * 1024), // 1GB

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
      () => this.memory.checkHeap('memory_heap', 1000 * 1024 * 1024), // 1GB
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
