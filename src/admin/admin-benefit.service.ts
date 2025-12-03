import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedemptionStatus } from '@prisma/client';
import { CreateBenefitDTO } from '../benefits/dto/create-benefit.dto';
import { UpdateBenefitDto } from '../benefits/dto/update-benefit.dto';

@Injectable()
export class AdminBenefitsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lista todos os benefícios com estatísticas
   */
  async getAllBenefits() {
    const benefits = await this.prisma.benefit.findMany({
      include: {
        _count: {
          select: {
            redemptions: true,
          },
        },
        redemptions: {
          where: {
            status: {
              in: ['PENDING', 'USED'],
            },
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return benefits.map((benefit) => ({
      ...benefit,
      activeRedemptions: benefit.redemptions.length,
      redemptions: undefined, // Remove do retorno
    }));
  }

  /**
   * Busca um benefício por ID com detalhes
   */
  async getBenefitById(id: string) {
    const benefit = await this.prisma.benefit.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            redemptions: true,
          },
        },
        redemptions: {
          take: 20,
          orderBy: {
            redeemedAt: 'desc',
          },
          include: {
            professional: {
              select: {
                id: true,
                name: true,
                phone: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!benefit) {
      throw new NotFoundException('Benefício não encontrado');
    }

    return benefit;
  }

  /**
   * Cria um novo benefício
   */
  async createBenefit(dto: CreateBenefitDTO) {
    // Validações adicionais
    if (dto.expiresAt && dto.expiresAt < new Date()) {
      throw new BadRequestException(
        'Data de expiração não pode ser no passado',
      );
    }

    if (dto.pointsCost <= 0) {
      throw new BadRequestException('Custo em pontos deve ser maior que zero');
    }

    return this.prisma.benefit.create({
      data: dto,
    });
  }

  /**
   * Atualiza um benefício existente
   */
  async updateBenefit(id: string, dto: UpdateBenefitDto) {
    const benefit = await this.prisma.benefit.findUnique({
      where: { id },
    });

    if (!benefit) {
      throw new NotFoundException('Benefício não encontrado');
    }

    // Validações
    if (dto.expiresAt && dto.expiresAt < new Date()) {
      throw new BadRequestException(
        'Data de expiração não pode ser no passado',
      );
    }

    if (dto.pointsCost !== undefined && dto.pointsCost <= 0) {
      throw new BadRequestException('Custo em pontos deve ser maior que zero');
    }

    return this.prisma.benefit.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Remove um benefício
   * Soft delete se houver resgates ativos, hard delete caso contrário
   */
  async deleteBenefit(id: string) {
    const benefit = await this.prisma.benefit.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            redemptions: {
              where: {
                status: {
                  in: ['PENDING', 'USED'],
                },
              },
            },
          },
        },
      },
    });

    if (!benefit) {
      throw new NotFoundException('Benefício não encontrado');
    }

    // Se houver resgates ativos, apenas desativa
    if (benefit._count.redemptions > 0) {
      const updated = await this.prisma.benefit.update({
        where: { id },
        data: {
          isActive: false,
        },
      });

      return {
        ...updated,
        message: 'Benefício desativado pois possui resgates ativos',
        softDeleted: true,
      };
    }

    // Caso contrário, pode deletar permanentemente
    await this.prisma.benefit.delete({
      where: { id },
    });

    return {
      message: 'Benefício removido permanentemente',
      softDeleted: false,
    };
  }

  /**
   * Ativa/Desativa um benefício
   */
  async toggleBenefitStatus(id: string) {
    const benefit = await this.prisma.benefit.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!benefit) {
      throw new NotFoundException('Benefício não encontrado');
    }

    return this.prisma.benefit.update({
      where: { id },
      data: {
        isActive: !benefit.isActive,
      },
    });
  }

  /**
   * Lista todos os resgates com filtros opcionais
   */
  async getAllRedemptions(filters?: {
    status?: RedemptionStatus;
    benefitId?: string;
    professionalId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.benefitId) {
      where.benefitId = filters.benefitId;
    }

    if (filters?.professionalId) {
      where.professionalId = filters.professionalId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.redeemedAt = {};
      if (filters.startDate) {
        where.redeemedAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.redeemedAt.lte = filters.endDate;
      }
    }

    return this.prisma.benefitRedemption.findMany({
      where,
      include: {
        professional: {
          select: {
            id: true,
            name: true,
            phone: true,
            level: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        benefit: {
          select: {
            id: true,
            name: true,
            description: true,
            pointsCost: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        redeemedAt: 'desc',
      },
    });
  }

  /**
   * Busca um resgate específico
   */
  async getRedemptionById(id: string) {
    const redemption = await this.prisma.benefitRedemption.findUnique({
      where: { id },
      include: {
        professional: {
          select: {
            id: true,
            name: true,
            phone: true,
            level: true,
            points: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        benefit: true,
      },
    });

    if (!redemption) {
      throw new NotFoundException('Resgate não encontrado');
    }

    return redemption;
  }

  /**
   * Atualiza status de um resgate
   */
  async updateRedemptionStatus(redemptionId: string, status: RedemptionStatus) {
    const redemption = await this.prisma.benefitRedemption.findUnique({
      where: { id: redemptionId },
      include: {
        benefit: true,
        professional: true,
      },
    });

    if (!redemption) {
      throw new NotFoundException('Resgate não encontrado');
    }

    // Validações de transição de status
    if (
      redemption.status === RedemptionStatus.EXPIRED ||
      redemption.status === RedemptionStatus.CANCELED
    ) {
      throw new BadRequestException(
        'Não é possível alterar status de resgate expirado ou cancelado',
      );
    }

    const updateData: any = { status };

    // Se está marcando como usado, registra a data
    if (status === RedemptionStatus.USED && !redemption.usedAt) {
      updateData.usedAt = new Date();
    }

    // Se está cancelando, devolve os pontos e incrementa a quantidade
    if (status === RedemptionStatus.CANCELED) {
      await this.prisma.$transaction(async (tx) => {
        // Atualiza o resgate
        await tx.benefitRedemption.update({
          where: { id: redemptionId },
          data: updateData,
        });

        // Devolve os pontos ao profissional
        await tx.professional.update({
          where: { id: redemption.professionalId },
          data: {
            points: {
              increment: redemption.pointsSpent,
            },
          },
        });

        // Registra no histórico
        await tx.pointHistory.create({
          data: {
            professionalId: redemption.professionalId,
            operation: 'ADD',
            value: redemption.pointsSpent,
            source: `Cancelamento do resgate: ${redemption.benefit.name}`,
          },
        });

        // Incrementa a quantidade do benefício de volta (se tiver quantidade definida)
        if (redemption.benefit.quantity !== null) {
          await tx.benefit.update({
            where: { id: redemption.benefitId },
            data: {
              quantity: {
                increment: 1,
              },
            },
          });
        }
      });

      return this.getRedemptionById(redemptionId);
    }

    return this.prisma.benefitRedemption.update({
      where: { id: redemptionId },
      data: updateData,
    });
  }

  /**
   * Estatísticas gerais de benefícios
   */
  async getBenefitsStatistics() {
    const [
      totalBenefits,
      activeBenefits,
      totalRedemptions,
      pendingRedemptions,
      usedRedemptions,
      totalPointsSpent,
    ] = await Promise.all([
      this.prisma.benefit.count(),
      this.prisma.benefit.count({ where: { isActive: true } }),
      this.prisma.benefitRedemption.count(),
      this.prisma.benefitRedemption.count({
        where: { status: 'PENDING' },
      }),
      this.prisma.benefitRedemption.count({
        where: { status: 'USED' },
      }),
      this.prisma.benefitRedemption.aggregate({
        _sum: {
          pointsSpent: true,
        },
      }),
    ]);

    // Top 5 benefícios mais resgatados
    const topBenefits = await this.prisma.benefit.findMany({
      include: {
        _count: {
          select: {
            redemptions: true,
          },
        },
      },
      orderBy: {
        redemptions: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    return {
      totalBenefits,
      activeBenefits,
      inactiveBenefits: totalBenefits - activeBenefits,
      totalRedemptions,
      pendingRedemptions,
      usedRedemptions,
      totalPointsSpent: totalPointsSpent._sum.pointsSpent || 0,
      topBenefits: topBenefits.map((b) => ({
        id: b.id,
        name: b.name,
        redemptionsCount: b._count.redemptions,
        pointsCost: b.pointsCost,
      })),
    };
  }

  /**
   * Expira resgates vencidos (pode ser chamado por um cron job)
   */
  async expireRedemptions() {
    const now = new Date();

    const expiredRedemptions = await this.prisma.benefitRedemption.updateMany({
      where: {
        status: RedemptionStatus.PENDING,
        expiresAt: {
          lte: now,
        },
      },
      data: {
        status: RedemptionStatus.EXPIRED,
      },
    });

    return {
      expiredCount: expiredRedemptions.count,
      message: `${expiredRedemptions.count} resgates expirados`,
    };
  }
}
