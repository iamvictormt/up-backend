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
}
