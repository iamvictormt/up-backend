// src/statistics/dto/dashboard-stats.dto.ts
export class DashboardStatsDto {
  totalProfessionals: number;
  activeUsers: number;
  totalStores: number;
  pendingApprovals: number;
  monthlyGrowth: number;
  totalEvents: number;
  completedEvents: number;
  totalPoints: number;
}

export class RecentActivityDto {
  id: number;
  action: string;
  user: string;
  time: string;
  type: 'success' | 'warning' | 'info' | 'error';
}

export class MonthlyGrowthDto {
  month: string;
  value: number;
}

export class UserDistributionDto {
  category: string;
  percentage: number;
  color: string;
}

export class PointsBreakdownDto {
  totalPoints: number;
  monthlyPoints: number;
  weeklyPoints: number;
}
