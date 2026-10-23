import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PointOperation, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PointsService {
  constructor(private prisma: PrismaService) {}

  async addPoints(
    professionalId: string,
    value: number,
    source: string,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx || this.prisma;
    if (value <= 0) {
      throw new Error('O valor deve ser maior que zero');
    }

    const professional = await prisma.professional.findUnique({
      where: { id: professionalId },
    });

    if (!professional) {
      throw new Error('Profissional não encontrado');
    }

    // Adiciona pontos e registra no histórico
    const execute = async (client: Prisma.TransactionClient) => {
      const updatedProfessional = await client.professional.update({
        where: { id: professionalId },
        data: { points: { increment: value } },
      });
      const history = await client.pointHistory.create({
        data: {
          professionalId,
          operation: PointOperation.ADD,
          value,
          source,
        },
      });
      return {
        professional: updatedProfessional,
        history,
        newBalance: updatedProfessional.points,
      };
    };

    if (tx) {
      return execute(tx);
    }

    return this.prisma.$transaction(execute);
  }

  // Tira pontos só se o saldo cobrir: o profissional pode já ter gasto os pontos em benefícios
  async removePoints(
    professionalId: string,
    value: number,
    source: string,
    tx: Prisma.TransactionClient,
  ) {
    const { count } = await tx.professional.updateMany({
      where: { id: professionalId, points: { gte: value } },
      data: { points: { decrement: value } },
    });

    if (count === 0) {
      throw new BadRequestException(
        'O profissional já usou parte desses pontos e o saldo atual não cobre a correção.',
      );
    }

    return tx.pointHistory.create({
      data: { professionalId, operation: PointOperation.REMOVE, value, source },
    });
  }

  async getBalance(professionalId: string) {
    const professional = await this.prisma.professional.findUnique({
      where: { id: professionalId },
      select: { id: true, name: true, points: true }
    });

    if (!professional) {
      throw new Error('Profissional não encontrado');
    }

    return professional;
  }

  async getHistory(professionalId: string, limit = 50) {
    const history = await this.prisma.pointHistory.findMany({
      where: { professionalId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return history;
  }

  // Período fechado (datas YYYY-MM-DD, "to" inclusivo). ponytail: teto de 2000 linhas por período, paginar se algum profissional chegar perto
  async getHistoryInRange(professionalId: string, from?: string, to?: string) {
    const parse = (value: string, endOfDay = false) => {
      const date = new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00'}-03:00`);
      if (Number.isNaN(date.getTime())) throw new BadRequestException('Data inválida.');
      return date;
    };

    return this.prisma.pointHistory.findMany({
      where: {
        professionalId,
        createdAt: {
          ...(from ? { gte: parse(from) } : {}),
          ...(to ? { lte: parse(to, true) } : {}),
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 2000,
    });
  }

  async getHistoryByUserEmail(email: string, limit = 50, range: { from?: string; to?: string } = {}) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { professional: true },
    });

    if (!user || !user.professional) {
      throw new NotFoundException('Perfil de profissional não encontrado.');
    }

    const history = range.from || range.to
      ? await this.getHistoryInRange(user.professional.id, range.from, range.to)
      : await this.getHistory(user.professional.id, limit);

    // Conexão Premiada: troca o código cru por "Compra em <loja> – R$ X" no extrato
    const parse = (source: string) => source.match(/^CONEXAO_PREMIADA_(?:(AJUSTE|ESTORNO)_)?([0-9A-F]+)$/);
    const codes = history.map((h) => parse(h.source)?.[2]).filter(Boolean) as string[];
    if (!codes.length) return history;

    const sales = await this.prisma.physicalSale.findMany({
      where: { code: { in: codes } },
      select: { code: true, value: true, partner: { select: { tradeName: true } } },
    });
    const byCode = new Map(sales.map((s) => [s.code, s]));

    return history.map((h) => {
      const match = parse(h.source);
      const sale = match && byCode.get(match[2]);
      if (!sale) return h;
      const kind = match[1] === 'AJUSTE' ? 'ADJUSTMENT' : match[1] === 'ESTORNO' ? 'CANCELLATION' : 'PURCHASE';
      return { ...h, storeName: sale.partner.tradeName, saleValue: sale.value, saleKind: kind };
    });
  }
}
