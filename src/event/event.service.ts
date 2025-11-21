import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { RegisterProfessionalDto } from './dto/register-professional.dto';

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

  async registerProfessional(eventId: string, dto: RegisterProfessionalDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) throw new NotFoundException('Evento não encontrado');

    if (event.filledSpots >= event.totalSpots) {
      throw new BadRequestException('Evento já está lotado');
    }

    const existingRegistration = await this.prisma.eventRegistration.findUnique(
      {
        where: {
          professionalId_eventId: {
            professionalId: dto.professionalId,
            eventId: eventId,
          },
        },
      },
    );

    if (existingRegistration) {
      throw new BadRequestException(
        'Profissional já está registrado neste evento',
      );
    }

    try {
      const registration = await this.prisma.eventRegistration.create({
        data: {
          professional: { connect: { id: dto.professionalId } },
          event: { connect: { id: eventId } },
        },
      });

      await this.prisma.event.update({
        where: { id: eventId },
        data: { filledSpots: { increment: 1 } },
      });

      return registration;
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'Profissional já está registrado neste evento',
        );
      }
      throw error;
    }
  }

  findAll() {
    return this.prisma.event.findMany({
      where: {
        isActive: true,
        date: { gte: new Date() },
      },
      include: {
        address: true,
        store: true,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async findUserEvents(userId: string) {
    return this.prisma.event.findMany({
      where: {
        participants: {
          some: {
            professional: {
              user: {
                id: userId,
              }
            }
          },
        },
      },
      include: {
        address: true,
        store: true,
        participants: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
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
