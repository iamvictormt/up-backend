import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoreService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateStoreDto) {
    const store = await this.prisma.store.create({
      data: {
        name: dto.name,
        description: dto.description,
        website: dto.website,
        openingHours: dto.openingHours,
        partner: {
          connect: { id: dto.partnerId },
        },
        address: {
          create: {
            ...dto.address,
          },
        },
      },
      include: {
        address: true,
      },
    });

    return { store };
  }

  async update(userId: string, dto: UpdateStoreDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        partnerSupplier: {
          include: { store: true },
        },
      },
    });

    const store = user?.partnerSupplier?.store;

    if (!store) {
      throw new NotFoundException('Loja não encontrada para esse usuário!');
    }

    return this.prisma.store.update({
      where: { id: store.id },
      data: {
        name: dto.name,
        description: dto.description,
        website: dto.website,
        openingHours: dto.openingHours,
        address: dto.address
          ? {
              update: {
                ...dto.address,
              },
            }
          : undefined,
      },
      include: {
        address: true,
        products: true,
        events: {
          include: {
            address: true,
          },
        },
      },
    });
  }

  async findMyStore(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        partnerSupplier: {
          include: { store: true },
        },
      },
    });

    const store = user?.partnerSupplier?.store;

    if (!store) {
      return null;
    }

    return this.prisma.store.findUnique({
      where: { id: store.id },
      include: {
        address: true,
        products: true,
        events: {
          include: {
            address: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.store.findMany({
      include: {
        address: true,
        products: true,
        events: {
          include: {
            address: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.store.findUnique({
      where: { id },
      include: {
        address: true,
        products: true,
        events: {
          include: {
            address: true,
          },
        },
      },
    });
  }
}
