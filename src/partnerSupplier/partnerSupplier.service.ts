import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePartnerSupplierDto } from './dto/create-partnerSupplier.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { UpdatePartnerSupplierDto } from './dto/update-partnerSupplier.dto';

@Injectable()
export class PartnerSupplierService {
  constructor(
    private readonly prisma: PrismaService,
    private userService: UserService,
  ) {}

  async create(dto: CreatePartnerSupplierDto, userDto: CreateUserDto) {
    const emailExists = await this.userService.checkIfEmailExists(
      userDto.email,
    );
    if (emailExists) {
      throw new ConflictException('Email já cadastrado.');
    }

    const partnerSupplier = await this.prisma.partnerSupplier.create({
      data: {
        tradeName: dto.tradeName,
        companyName: dto.companyName,
        document: dto.document,
        stateRegistration: dto.stateRegistration,
        contact: dto.contact,
        profileImage: dto.profileImage,
        address: {
          create: dto.address,
        },
      },
      include: {
        address: true,
      },
    });

    await this.prisma.store.create({
      data: {
        name: partnerSupplier.tradeName,
        address: {
          connect: {
            id: partnerSupplier.addressId
              ? partnerSupplier.addressId
              : undefined,
          },
        },
        partner: {
          connect: { id: partnerSupplier.id },
        },
      },
    });

    const user = await this.userService.createUserWithRelation(
      userDto,
      partnerSupplier.id,
      undefined,
    );

    return { partnerSupplier, user };
  }

  async updateAccessPending(id: string, dto: UpdatePartnerSupplierDto) {
    const partner = await this.prisma.partnerSupplier.findUnique({
      where: { id },
    });

    if (!partner) {
      throw new NotFoundException('Fornecedor parceiro não encontrado!');
    }

    return this.prisma.partnerSupplier.update({
      where: { id },
      data: {
        accessPending: dto.accessPending,
      },
    });
  }

  async findAll() {
    return this.prisma.partnerSupplier.findMany({
      where: {
        accessPending: false
      },
      include: {
        store: {
          include: {
            address: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.partnerSupplier.findUnique({
      where: { id },
    });
  }

  async findPending() {
    return this.prisma.user.findMany({
      where: {
        partnerSupplierId: {
          not: null,
        },
        partnerSupplier: {
          accessPending: true,
        }
      },
      include: {
        partnerSupplier: true,
      },
    });
  }
}
