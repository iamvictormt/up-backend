import { Injectable } from '@nestjs/common';
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
            state: dto.address.state,
            city: dto.address.city,
            district: dto.address.district,
            street: dto.address.street,
            complement: dto.address.complement,
            number: dto.address.number,
            zipCode: dto.address.zipCode,
          },
        },
      },
      include: {
        address: true,
      },
    });

    return { store };
  }

  async update(id: string, dto: UpdateStoreDto) {
    const store = await this.prisma.store.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        website: dto.website,
        openingHours: dto.openingHours,
        address: dto.address
          ? {
              update: {
                state: dto.address.state,
                city: dto.address.city,
                district: dto.address.district,
                street: dto.address.street,
                complement: dto.address.complement,
                number: dto.address.number,
                zipCode: dto.address.zipCode,
              },
            }
          : undefined,
      },
      include: {
        address: true,
      },
    });

    return { store };
  }

  async findAll() {
    return this.prisma.store.findMany({
      include: {
        address: true,
        products: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.store.findUnique({
      where: { id },
      include: {
        address: true,
        products: true,
      },
    });
  }
}
