import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePartnerSupplierDto } from './dto/create-partner-supplier.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { UpdatePartnerSupplierDto } from './dto/update-partner-supplier.dto';
import { MailService } from '../mail/mail.service';
import { getUsername } from '../ultis';

@Injectable()
export class PartnerSupplierService {
  constructor(
    private readonly prisma: PrismaService,
    private userService: UserService,
    private mailService: MailService,
  ) {}

  async create(dto: CreatePartnerSupplierDto, userDto: CreateUserDto) {
    const emailExists = await this.userService.checkIfEmailExists(
      userDto.email,
    );
    if (emailExists) {
      throw new ConflictException('Email já cadastrado.');
    }

    const hashedPassword = await this.userService.hashPassword(userDto.password);

    return await this.prisma.$transaction(async (tx) => {
      const partnerSupplier = await tx.partnerSupplier.create({
        data: {
          tradeName: dto.tradeName,
          companyName: dto.companyName,
          document: dto.document,
          stateRegistration: dto.stateRegistration,
          contact: dto.contact,
        },
      });

      const user = await this.userService.createUserWithRelation(
        userDto,
        partnerSupplier.id,
        undefined,
        undefined,
        tx,
        hashedPassword,
      );

      return { partnerSupplier, user };
    });
  }

  async update(userId: string, dto: UpdatePartnerSupplierDto) {
    const user = await this.userService.findOne(userId);

    if (!user || !user.partnerSupplier) {
      throw new NotFoundException('Fornecedor parceiro não encontrado!');
    }

    return this.prisma.partnerSupplier.update({
      where: { id: user.partnerSupplier.id },
      data: { ...dto },
    });
  }

  async findAll() {
    return this.prisma.partnerSupplier.findMany({
      where: {
        accessPending: false,
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
      include: {
        store: {
          include: {
            address: true,
          },
        },
      },
    });
  }

  async findPending() {
    return await this.prisma.user.findMany({
      where: {
        partnerSupplierId: {
          not: null,
        },
        partnerSupplier: {
          accessPending: true,
        },
      },
      include: {
        partnerSupplier: true,
      },
    });
  }
}
