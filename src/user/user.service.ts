import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUserWithRelation(
    userDto: CreateUserDto,
    partnerSupplierId?: string,
    professionalId?: string,
    loveDecorationId?: string
  ) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userDto.password, salt);

    return this.prisma.user.create({
      data: {
        email: userDto.email,
        password: hashedPassword,
        partnerSupplierId,
        professionalId,
        loveDecorationId
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
        partnerSupplier: true,
        professional: true,
        loveDecoration: true,
        partnerSupplierId: false,
        professionalId: false,
        loveDecorationId: false
      },
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        password: true,
        createdAt: true,
        updatedAt: true,
        partnerSupplier: true,
        professional: true,
        loveDecoration: true,
        partnerSupplierId: false,
        professionalId: false,
        loveDecorationId: false
      },
    });
  }

  async findOneById(id: string) {
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

  remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
