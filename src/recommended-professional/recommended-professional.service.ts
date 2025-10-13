import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateRecommendedProfessionalDto } from './dto/update-recommended-professional.dto';
import { CreateRecommendedProfessionalDto } from './dto/create-recommended-professional.dto';

interface FindAllOptions {
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class RecommendedProfessionalService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateRecommendedProfessionalDto) {
    return this.prisma.recommendedProfessional.create({
      data: {
        name: data.name,
        profession: data.profession,
        description: data.description,
        phone: data.phone,
        email: data.email,
        profileImage: data.profileImage,
        isActive: data.isActive ?? true,
        address: {
          create: {
            ...data.address,
          },
        },
        availableDays: data.availableDays
          ? {
              create: data.availableDays.map((day) => ({
                dayOfWeek: day,
              })),
            }
          : undefined,
        socialMedia: data.socialMedia
          ? {
              create: {
                instagram: data.socialMedia.instagram,
                linkedin: data.socialMedia.linkedin,
                whatsapp: data.socialMedia.whatsapp,
              },
            }
          : undefined,
      },
      include: {
        availableDays: true,
        socialMedia: true,
        address: true,
      },
    });
  }

  async findAll({ search, page = 1, limit = 6 }: FindAllOptions) {
    const skip = (page - 1) * limit;

    return this.prisma.recommendedProfessional.findMany({
      where: {
        isActive: true,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { profession: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      skip,
      take: limit,
      include: {
        address: true,
        socialMedia: true,
        availableDays: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.recommendedProfessional.findUnique({
      where: { id },
      include: {
        address: true,
        socialMedia: true,
        availableDays: true,
      },
    });
  }

  async update(id: string, data: UpdateRecommendedProfessionalDto) {
    const { socialMedia, availableDays, address, ...rest } = data;

    return this.prisma.recommendedProfessional.update({
      where: { id },
      data: {
        ...rest,

        address: address
          ? {
              update: {
                state: address.state,
                city: address.city,
                district: address.district,
                street: address.street,
                complement: address.complement,
                number: address.number,
                zipCode: address.zipCode,
              },
            }
          : undefined,

        socialMedia: socialMedia
          ? {
              upsert: {
                create: {
                  instagram: socialMedia.instagram,
                  linkedin: socialMedia.linkedin,
                  whatsapp: socialMedia.whatsapp,
                },
                update: {
                  instagram: socialMedia.instagram,
                  linkedin: socialMedia.linkedin,
                  whatsapp: socialMedia.whatsapp,
                },
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
        address: true,
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
