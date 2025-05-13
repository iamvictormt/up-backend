import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePartnerSupplierDto } from './dto/createPartnerSupplier.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { UpdatePartnerSupplierDto } from './dto/updatePartnerSupplier.dto';

@Injectable()
export class PartnerSupplierService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async createPartnerSupplier(
    partnerSupplierDto: CreatePartnerSupplierDto,
    userDto: CreateUserDto,
  ) {
    const emailExists = await this.userService.checkIfEmailExists(
      userDto.email,
    );
    if (emailExists) {
      throw new ConflictException('Email já cadastrado.');
    }

    const partnerSupplier = await this.prisma.partnerSupplier.create({
      data: {
        tradeName: partnerSupplierDto.tradeName,
        companyName: partnerSupplierDto.companyName,
        document: partnerSupplierDto.document,
        stateRegistration: partnerSupplierDto.stateRegistration,
        // address: partnerSupplierDto.address,
        contact: partnerSupplierDto.contact,
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
