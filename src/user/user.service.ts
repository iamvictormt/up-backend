import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { AddressService } from '../address/address.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private addressService: AddressService,
  ) {}

  async createUserWithRelation(
    userDto: CreateUserDto,
    partnerSupplierId?: string,
    professionalId?: string,
    loveDecorationId?: string,
  ) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userDto.password, salt);
    const address = await this.addressService.create(userDto.address);

    return this.prisma.user.create({
      data: {
        email: userDto.email,
        password: hashedPassword,
        profileImage: userDto.profileImage,
        partnerSupplierId,
        professionalId,
        loveDecorationId,
        addressId: address.id,
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
        loveDecorationId: false,
      },
    });
  }

  async update(dto: UpdateUserDto) {
    const { address, ...userData } = dto;

    return this.prisma.user.update({
      where: { id: dto.id },
      data: {
        ...userData,
        address: address
          ? {
              update: {
                ...address,
              },
            }
          : undefined,
      },
    });
  }

  async updateProfileImage(userId: string, profileImage: string | undefined) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { profileImage },
    });
  }

  async checkIfEmailExists(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user !== null;
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        partnerSupplier: true,
        professional: true,
        loveDecoration: true,
        address: true,
        profileImage: true
      },
    });
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
