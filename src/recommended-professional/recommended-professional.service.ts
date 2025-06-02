import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateRecommendedProfessionalDto } from './dto/update-recommended-professional.dto';
import { CreateRecommendedProfessionalDto } from './dto/create-recommended-professional.dto';

@Injectable()
export class RecommendedProfessionalService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateRecommendedProfessionalDto) {
    return this.prisma.recommendedProfessional.create({
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
    return this.prisma.recommendedProfessional.findMany({
      include: {
        availableDays: true,
        socialMedia: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.recommendedProfessional.findUnique({
      where: { id },
      include: {
        availableDays: true,
        socialMedia: true,
      },
    });
  }

  async update(id: string, data: UpdateRecommendedProfessionalDto) {
    const { socialMedia, availableDays, ...rest } = data;

    return this.prisma.recommendedProfessional.update({
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
              deleteMany: {},
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
    return this.prisma.recommendedProfessional.delete({
      where: { id },
    });
  }
}
