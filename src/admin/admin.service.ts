import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPartnerSuppliers() {
    return this.prisma.partnerSupplier.findMany({
      include: {
        store: {
          include: {
            address: true,
          },
        },
      },
    });
  }

  async deletePartnerSupplier(id: string) {
    return this.prisma.$transaction(async (tx) => {
      // Apaga subscription
      await tx.subscription.deleteMany({
        where: { partnerSupplierId: id },
      });

      // Apaga usuário vinculado
      await tx.user.deleteMany({
        where: { partnerSupplierId: id },
      });

      // Apaga endereço vinculado à loja
      await tx.address.deleteMany({
        where: {
          stores: {
            some: {
              partnerId: id,
            },
          },
        },
      });

      // Apaga loja
      await tx.store.deleteMany({
        where: { partnerId: id },
      });

      // Finalmente, apaga o PartnerSupplier
      return tx.partnerSupplier.delete({
        where: { id },
      });
    });
  }
}
