import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PointsService } from 'src/points/points.service';
import { RegisterSaleDto } from './dto/register-sale.dto';
import { RedeemCodeDto } from './dto/redeem-code.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class ConexaoPremiadaService {
  constructor(
    private prisma: PrismaService,
    private pointsService: PointsService,
  ) {}

  async registerSale(userId: string, dto: RegisterSaleDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { partnerSupplier: true },
    });

    if (!user || !user.partnerSupplier) {
      throw new ForbiddenException('Apenas parceiros podem registrar vendas.');
    }

    const partner = user.partnerSupplier;

    // Pontos fixos por venda, conforme solicitado (ex: 10 pontos por venda registrada)
    // Ou poderia ser baseado no valor. Vou usar 50 pontos fixos como exemplo,
    // ou deixar configurável. O usuário disse: "esses pontos eu imagino que vocês podem deixar fixo"
    const pointsToAward = 50;

    if (partner.pointsLimit > 0 && (partner.currentPointsAwarded + pointsToAward) > partner.pointsLimit) {
      throw new BadRequestException('Limite de pontos para distribuição atingido por este parceiro.');
    }

    const code = this.generateUniqueCode();

    const sale = await this.prisma.physicalSale.create({
      data: {
        code,
        customerName: dto.customerName,
        value: dto.value,
        sellerName: dto.sellerName,
        invoice: dto.invoice,
        points: pointsToAward,
        partnerId: partner.id,
      },
    });

    return {
      message: 'Venda registrada com sucesso.',
      code: sale.code,
      points: sale.points,
    };
  }

  async redeemCode(userId: string, dto: RedeemCodeDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { professional: true },
    });

    if (!user || !user.professional) {
      throw new ForbiddenException('Apenas profissionais podem resgatar códigos.');
    }

    const professional = user.professional;

    const sale = await this.prisma.physicalSale.findUnique({
      where: { code: dto.code },
      include: { partner: true },
    });

    if (!sale) {
      throw new NotFoundException('Código inválido.');
    }

    if (sale.redeemedAt) {
      throw new BadRequestException('Este código já foi resgatado.');
    }

    // Verificar novamente o limite do parceiro no momento do resgate
    if (sale.partner.pointsLimit > 0 && (sale.partner.currentPointsAwarded + sale.points) > sale.partner.pointsLimit) {
        throw new BadRequestException('O limite de pontos deste parceiro foi atingido. Entre em contato com a loja.');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Marcar a venda como resgatada
      await tx.physicalSale.update({
        where: { id: sale.id },
        data: {
          professionalId: professional.id,
          redeemedAt: new Date(),
        },
      });

      // 2. Adicionar pontos ao profissional
      await this.pointsService.addPoints(
        professional.id,
        sale.points,
        `CONEXAO_PREMIADA_${sale.code}`,
        tx,
      );

      // 3. Atualizar o total distribuído pelo parceiro
      await tx.partnerSupplier.update({
        where: { id: sale.partnerId },
        data: {
          currentPointsAwarded: { increment: sale.points },
        },
      });

      return {
        message: 'Pontos resgatados com sucesso!',
        points: sale.points,
      };
    });
  }

  private generateUniqueCode(): string {
    // Gera um código de 8 caracteres alfanuméricos
    return randomBytes(4).toString('hex').toUpperCase();
  }
}
