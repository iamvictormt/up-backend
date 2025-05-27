import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEventDto) {
    await this.prisma.event.create({
      data: {
        name: dto.name,
        description: dto.description,
        date: dto.date,
        type: dto.type,
        points: dto.points,
        totalSpots: dto.totalSpots,
        store: {
          connect: { id: dto.storeId },
        },
        address: {
          create: dto.address,
        },
      },
    });
  }

  findAll() {
    return this.prisma.event.findMany({
      include: { address: true, store: true, participants: true },
    });
  }

  findOne(id: string) {
    return this.prisma.event.findUnique({
      where: { id },
      include: { address: true, store: true, participants: true },
    });
  }

  async update(id: string, data: UpdateEventDto) {
    const { address, ...eventData } = data;

    const prismaUpdateData: any = {
      ...eventData,
    };

    if (address) {
      prismaUpdateData.address = {
        update: {
          state: address.state,
          city: address.city,
          district: address.district,
          street: address.street,
          complement: address.complement,
          number: address.number,
          zipCode: address.zipCode,
        },
      };
    }

    return this.prisma.event.update({
      where: { id },
      data: prismaUpdateData,
    });
  }

  remove(id: string) {
    return this.prisma.event.delete({
      where: { id },
    });
  }
}
