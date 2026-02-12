import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AddressService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAddressDto, tx?: Prisma.TransactionClient) {
    const prisma = tx || this.prisma;
    return prisma.address.create({
      data: dto,
    });
  }
}
