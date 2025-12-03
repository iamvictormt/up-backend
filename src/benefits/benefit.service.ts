import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedeemBenefitDto } from './dto/redeem-benefit.dto';

@Injectable()
export class BenefitService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lista benefícios disponíveis para resgate
   * Filtra apenas benefícios ativos e não expirados
   */
  async getAvailableBenefits() {
    const now = new Date();

    return this.prisma.benefit.findMany({
      where: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
      },
      orderBy: [{ pointsCost: 'asc' }, { createdAt: 'desc' }],
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

  /**
   * Lista benefícios resgatados pelo profissional logado
   */
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
      throw new NotFoundException('Profissional não encontrado');
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

      // Deduz os pontos do profissional
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

      // Decrementa a quantidade do benefício (se tiver quantidade definida)
      if (benefit.quantity !== null) {
        await tx.benefit.update({
          where: { id: benefitId },
          data: {
            quantity: {
              decrement: 1,
            },
          },
        });
      }

      return newRedemption;
    });

    return redemption;
  }

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
