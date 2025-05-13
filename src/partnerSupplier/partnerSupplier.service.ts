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
        address: dto.address
          ? {
              create: {
                state: dto.address.state,
                city: dto.address.city,
                district: dto.address.district,
                street: dto.address.street,
                complement: dto.address.complement,
                number: dto.address.number,
                zipCode: dto.address.zipCode,
              },
            }
          : undefined,
      },
      include: {
        address: true,
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

    return this.prisma.user.update({
      where: { id },
      data: {
        accessPending: dto.accessPending,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      where: {
        partnerSupplierId: {
          not: null,
        },
      },
      include: {
        partnerSupplier: true,
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
        accessPending: true,
        partnerSupplierId: {
          not: null,
        },
      },
      include: {
        partnerSupplier: true,
      },
    });
  }
}
