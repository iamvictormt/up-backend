import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProfessionDto } from './dto/create-profession.dto';

@Injectable()
export class ProfessionService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateProfessionDto) {
    return this.prisma.profession.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.profession.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async remove(id: string) {
    return this.prisma.profession.delete({
      where: { id },
    });
  }
}
