import { Injectable, NotFoundException } from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { getUsername } from 'src/ultis';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

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

  async toggleAccessPending(id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        partnerSupplierId: id,
      },
      include: {
        partnerSupplier: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Fornecedor parceiro não encontrado!');
    }

    if (!user.partnerSupplier) {
      throw new NotFoundException('Fornecedor parceiro não encontrado!');
    }

    const currentAccessPending = user.partnerSupplier.accessPending;
    const newAccessPending = !currentAccessPending;

    await this.mailService.sendMail(
      user.email,
      newAccessPending ? 'Cadastro reprovado' : 'Cadastro aprovado',
      newAccessPending ? 'cadastro-reprovado.html' : 'cadastro-aprovado.html',
      {
        username: getUsername(user),
      },
    );

    return this.prisma.partnerSupplier.update({
      where: { id },
      data: {
        accessPending: newAccessPending,
      },
    });
  }
}
