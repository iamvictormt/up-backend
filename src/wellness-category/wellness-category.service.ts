import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWellnessCategoryDto } from './dto/create-wellness-category.dto';

@Injectable()
export class WellnessCategoryService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateWellnessCategoryDto) {
    return this.prisma.wellnessCategory.create({ data });
  }

  async findAll() {
    return this.prisma.wellnessCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async remove(id: string) {
    return this.prisma.wellnessCategory.delete({ where: { id } });
  }
}
