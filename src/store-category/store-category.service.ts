import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStoreCategoryDto } from './dto/create-store-category.dto';

@Injectable()
export class StoreCategoryService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateStoreCategoryDto) {
    return this.prisma.storeCategory.create({ data });
  }

  async findAll() {
    return this.prisma.storeCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async remove(id: string) {
    return this.prisma.storeCategory.delete({ where: { id } });
  }
}
