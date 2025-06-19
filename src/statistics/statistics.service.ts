// statistics.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  DashboardStatsDto,
  RecentActivityDto,
  MonthlyGrowthDto,
  UserDistributionDto,
  PointsBreakdownDto,
} from './dto/dashboard.dto';

@Injectable()
export class StatisticsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getDashboardStats(): Promise<DashboardStatsDto> {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Buscar dados básicos em paralelo
    const [
      totalProfessionals,
      activeUsers,
      totalStores,
      pendingApprovals,
      totalEvents,
      completedEvents,
      totalPoints,
      currentMonthUsers,
      lastMonthUsers,
    ] = await Promise.all([
      // Total de profissionais
      this.prismaService.user.count({
        where: {
          professionalId: {
            not: null,
          },
        },
      }),

      // Total de usuários (como proxy para ativos)
      this.prismaService.user.count(),

      // Total de lojas
      this.prismaService.store.count(),

      // Usuários recentes como proxy para pendentes
      this.prismaService.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Total de eventos
      this.prismaService.event.count(),

      // Eventos com vagas preenchidas como proxy para completados
      this.prismaService.event.count({
        where: {
          filledSpots: {
            gt: 0,
          },
        },
      }),

      // Total de pontos dos eventos
      this.prismaService.event.aggregate({
        _sum: {
          points: true,
        },
      }),

      // Usuários do mês atual
      this.prismaService.user.count({
        where: {
          createdAt: {
            gte: currentMonth,
          },
        },
      }),

      // Usuários do mês passado
      this.prismaService.user.count({
        where: {
          createdAt: {
            gte: lastMonth,
            lt: currentMonth,
          },
        },
      }),
    ]);

    // Calcular crescimento mensal
    const monthlyGrowth =
      lastMonthUsers > 0
        ? ((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100
        : 0;

    return {
      totalProfessionals,
      activeUsers,
      totalStores,
      pendingApprovals,
      monthlyGrowth: Math.round(monthlyGrowth * 100) / 100,
      totalEvents,
      completedEvents,
      totalPoints: totalPoints._sum?.points || 0,
    };
  }

  async getRecentActivities(): Promise<RecentActivityDto[]> {
    // Simplificando - apenas usuários recentes
    const recentUsers = await this.prismaService.user.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        professionalId: true,
        partnerSupplierId: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    const activities: RecentActivityDto[] = recentUsers.map((user) => {
      const userType = user.professionalId
        ? 'profissional'
        : user.partnerSupplierId
          ? 'parceiro'
          : 'usuário';

      return {
        id: parseInt(user.id),
        action: `Novo ${userType} cadastrado`,
        user: user.email.split('@')[0],
        time: user.createdAt.toISOString(),
        type: 'success',
      };
    });

    return activities;
  }

  async getMonthlyGrowth(): Promise<MonthlyGrowthDto[]> {
    // Dados mocados para 12 meses - você pode ajustar depois
    const monthNames = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ];

    const currentDate = new Date();
    const data: MonthlyGrowthDto[] = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1,
      );
      const monthIndex = date.getMonth();
      const year = date.getFullYear();

      // Contar usuários deste mês (simplificado)
      const count = await this.prismaService.user.count({
        where: {
          createdAt: {
            gte: new Date(year, monthIndex, 1),
            lt: new Date(year, monthIndex + 1, 1),
          },
        },
      });

      data.push({
        month: `${monthNames[monthIndex]} ${year}`,
        value: count,
      });
    }

    return data;
  }

  async getUserDistribution(): Promise<UserDistributionDto[]> {
    // Contar usuários por tipo
    const [professionals, partners, clients] = await Promise.all([
      this.prismaService.user.count({
        where: {
          professionalId: {
            not: null,
          },
        },
      }),
      this.prismaService.user.count({
        where: {
          partnerSupplierId: {
            not: null,
          },
        },
      }),
      this.prismaService.user.count({
        where: {
          AND: [{ professionalId: null }, { partnerSupplierId: null }],
        },
      }),
    ]);

    const totalUsers = professionals + partners + clients;

    if (totalUsers === 0) {
      return [{ category: 'Sem dados', percentage: 100, color: '#6B7280' }];
    }

    const distribution: UserDistributionDto[] = [];

    if (professionals > 0) {
      distribution.push({
        category: 'Profissionais',
        percentage: Math.round((professionals / totalUsers) * 100),
        color: '#3B82F6',
      });
    }

    if (partners > 0) {
      distribution.push({
        category: 'Parceiros',
        percentage: Math.round((partners / totalUsers) * 100),
        color: '#10B981',
      });
    }

    if (clients > 0) {
      distribution.push({
        category: 'Clientes',
        percentage: Math.round((clients / totalUsers) * 100),
        color: '#F59E0B',
      });
    }

    return distribution;
  }

  async getPointsBreakdown(): Promise<PointsBreakdownDto> {
    // Simplificado - apenas total de pontos dos eventos
    const totalPoints = await this.prismaService.event.aggregate({
      _sum: {
        points: true,
      },
    });

    const total = totalPoints._sum?.points || 0;

    return {
      totalPoints: total,
      monthlyPoints: Math.round(total * 0.3), // 30% como estimativa do mês
      weeklyPoints: Math.round(total * 0.1), // 10% como estimativa da semana
    };
  }
}
