// listed-professional.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateListedProfessionalDto } from './dto/create-listed-professional.dto';
import { UpdateListedProfessionalDto } from './dto/update-listed-professional.dto';

@Injectable()
export class ListedProfessionalService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateListedProfessionalDto) {
    return this.prisma.listedProfessional.create({
      data: {
        ...data,
        availableDays: data.availableDays
          ? {
              create: data.availableDays.map((day) => ({ dayOfWeek: day })),
            }
          : undefined,
        socialMedia: data.socialMedia
          ? {
              create: data.socialMedia,
            }
          : undefined,
      },
      include: {
        availableDays: true,
        socialMedia: true,
      },
    });
  }

  findAll() {
    return this.prisma.listedProfessional.findMany({
      include: {
        availableDays: true,
        socialMedia: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.listedProfessional.findUnique({
      where: { id },
      include: {
        availableDays: true,
        socialMedia: true,
      },
    });
  }

  async update(id: string, data: UpdateListedProfessionalDto) {
    const { socialMedia, availableDays, ...rest } = data;

    return this.prisma.listedProfessional.update({
      where: { id },
      data: {
        ...rest,

        socialMedia: socialMedia
          ? {
              upsert: {
                create: socialMedia,
                update: socialMedia,
              },
            }
          : undefined,

        availableDays: availableDays
          ? {
              deleteMany: {}, // Apaga os dias existentes
              createMany: {
                data: availableDays.map((dayOfWeek) => ({ dayOfWeek })),
              },
            }
          : undefined,
      },
      include: {
        socialMedia: true,
        availableDays: true,
      },
    });
  }

  async toggleStatus(id: string) {
    const professional = await this.findOne(id);
    if (!professional) {
      throw new BadRequestException('Profissional não encontrado');
    }

    return this.update(id, {
      isActive: !professional.isActive,
    });
  }

  remove(id: string) {
    return this.prisma.listedProfessional.delete({
      where: { id },
    });
  }
}
