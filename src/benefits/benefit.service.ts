import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedeemBenefitDto } from './dto/redeem-benefit.dto';
import { CreateBenefitDTO } from './dto/create-benefit.dto';
import { UpdateBenefitDto } from './dto/update-benefit.dto';
import { RedemptionStatus } from '@prisma/client';

@Injectable()
export class BenefitService {
  constructor(private prisma: PrismaService) {}

  // ==================== USER ENDPOINTS ====================

  /**
   * Lista benefícios disponíveis para resgate
   * Filtra apenas benefícios ativos e não expirados
   */
  async getAvailableBenefits() {
    const now = new Date();

    return this.prisma.benefit.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: now } },
        ],
      },
      orderBy: [
        { pointsCost: 'asc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        name: true,
        description: true,
        pointsCost: true,
        quantity: true,
        imageUrl: true,
        expiresAt: true,
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
  }

  async getMyRedemptions(professionalId: string) {
    return this.prisma.benefitRedemption.findMany({
      where: {
        professionalId,
      },
      include: {
        benefit: {
          select: {
            name: true,
            description: true,
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
   * Resgata um benefício
   */
  async redeemBenefit(professionalId: string, dto: RedeemBenefitDto) {
    const { benefitId } = dto;

    // Busca o profissional com seus pontos
    const professional = await this.prisma.professional.findUnique({
      where: { id: professionalId },
      select: { points: true },
    });

    if (!professional) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Busca o benefício
    const benefit = await this.prisma.benefit.findUnique({
      where: { id: benefitId },
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

    // Validações
    if (!benefit.isActive) {
      throw new BadRequestException('Benefício não está disponível');
    }

    if (benefit.expiresAt && benefit.expiresAt < new Date()) {
      throw new BadRequestException('Benefício expirado');
    }

    if (professional.points < benefit.pointsCost) {
      throw new BadRequestException('Pontos insuficientes');
    }

    if (benefit.quantity !== null) {
      const redeemedCount = benefit._count.redemptions;
      if (redeemedCount >= benefit.quantity) {
        throw new BadRequestException('Benefício esgotado');
      }
    }

    // Gera código único para o resgate
    const code = this.generateRedemptionCode();

    // Define data de expiração do resgate (30 dias por padrão)
    const redemptionExpiresAt = new Date();
    redemptionExpiresAt.setDate(redemptionExpiresAt.getDate() + 30);

    // Executa a transação
    const redemption = await this.prisma.$transaction(async (tx) => {
      // Cria o resgate
      const newRedemption = await tx.benefitRedemption.create({
        data: {
          professionalId,
          benefitId,
          pointsSpent: benefit.pointsCost,
          code,
          expiresAt: redemptionExpiresAt,
        },
        include: {
          benefit: true,
        },
      });

      // Deduz os pontos do usuário
      await tx.professional.update({
        where: { id: professionalId },
        data: {
          points: {
            decrement: benefit.pointsCost,
          },
        },
      });

      // Registra no histórico de pontos
      await tx.pointHistory.create({
        data: {
          professionalId,
          operation: 'REMOVE',
          value: benefit.pointsCost,
          source: `Resgate do benefício: ${benefit.name}`,
        },
      });

      return newRedemption;
    });

    return redemption;
  }

  // ==================== ADMIN ENDPOINTS ====================

  /**
   * Lista todos os benefícios (admin)
   */
  async getAllBenefits() {
    return this.prisma.benefit.findMany({
      include: {
        _count: {
          select: {
            redemptions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Busca um benefício por ID (admin)
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
          take: 10,
          orderBy: {
            redeemedAt: 'desc',
          },
          include: {
            professional: {
              select: {
                name: true,
                phone: true,
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
   * Cria um novo benefício (admin)
   */
  async createBenefit(dto: CreateBenefitDTO) {
    return this.prisma.benefit.create({
      data: dto,
    });
  }

  /**
   * Atualiza um benefício (admin)
   */
  async updateBenefit(id: string, dto: UpdateBenefitDto) {
    const benefit = await this.prisma.benefit.findUnique({
      where: { id },
    });

    if (!benefit) {
      throw new NotFoundException('Benefício não encontrado');
    }

    return this.prisma.benefit.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Remove um benefício (admin)
   * Soft delete: apenas desativa
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
      return this.prisma.benefit.update({
        where: { id },
        data: {
          isActive: false,
        },
      });
    }

    // Caso contrário, pode deletar
    return this.prisma.benefit.delete({
      where: { id },
    });
  }

  /**
   * Lista todos os resgates (admin)
   */
  async getAllRedemptions(filters?: {
    status?: RedemptionStatus;
    benefitId?: string;
  }) {
    return this.prisma.benefitRedemption.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.benefitId && { benefitId: filters.benefitId }),
      },
      include: {
        professional: {
          select: {
            name: true,
            phone: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        benefit: {
          select: {
            name: true,
            description: true,
          },
        },
      },
      orderBy: {
        redeemedAt: 'desc',
      },
    });
  }

  /**
   * Atualiza status de um resgate (admin)
   */
  async updateRedemptionStatus(
    redemptionId: string,
    status: RedemptionStatus,
  ) {
    const redemption = await this.prisma.benefitRedemption.findUnique({
      where: { id: redemptionId },
    });

    if (!redemption) {
      throw new NotFoundException('Resgate não encontrado');
    }

    const updateData: any = { status };

    // Se está marcando como usado, registra a data
    if (status === 'USED' && !redemption.usedAt) {
      updateData.usedAt = new Date();
    }

    return this.prisma.benefitRedemption.update({
      where: { id: redemptionId },
      data: updateData,
    });
  }

  // ==================== HELPERS ====================

  /**
   * Gera código único para resgate
   */
  private generateRedemptionCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 10; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
