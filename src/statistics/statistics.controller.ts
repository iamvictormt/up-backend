// statistics.controller.ts
import { Controller, Get } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import {
  DashboardStatsDto,
  RecentActivityDto,
  MonthlyGrowthDto,
  UserDistributionDto,
  PointsBreakdownDto,
} from './dto/dashboard.dto';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('stats')
  async getStats(): Promise<DashboardStatsDto> {
    return await this.statisticsService.getDashboardStats();
  }

  @Get('activities')
  async getActivities(): Promise<RecentActivityDto[]> {
    return await this.statisticsService.getRecentActivities();
  }

  @Get('monthly-growth')
  async getMonthlyGrowth(): Promise<MonthlyGrowthDto[]> {
    return await this.statisticsService.getMonthlyGrowth();
  }

  @Get('user-distribution')
  async getUserDistribution(): Promise<UserDistributionDto[]> {
    return await this.statisticsService.getUserDistribution();
  }

  @Get('points')
  async getPointsBreakdown(): Promise<PointsBreakdownDto> {
    return await this.statisticsService.getPointsBreakdown();
  }
}
