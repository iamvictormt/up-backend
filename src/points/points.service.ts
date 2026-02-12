import { Injectable } from '@nestjs/common';
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
}
