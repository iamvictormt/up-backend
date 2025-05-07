import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUserWithRelation(
    userDto: CreateUserDto,
    partnerSupplierId?: number,
    professionalId?: number,
  ) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userDto.password, salt);

    return this.prisma.user.create({
      data: {
        email: userDto.email,
        password: hashedPassword,
        partnerSupplierId,
        professionalId,
        accessPending: !!partnerSupplierId,
      },
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        password: true,
        createdAt: true,
        updatedAt: true,
        accessPending: true,
        partnerSupplier: true,
        professional: true,
        partnerSupplierId: false,
        professionalId: false,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        password: true,
        createdAt: true,
        updatedAt: true,
        accessPending: true,
        partnerSupplier: true,
        professional: true,
        partnerSupplierId: false,
        professionalId: false,
      },
    });
  }

  async findOneById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async checkIfEmailExists(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user !== null;
  }

  remove(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
}
