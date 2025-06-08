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
import { UpdateEventDto } from '../event/dto/update-event.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { UpdateProfessionalDto } from '../professional/dto/update-professional.dto';

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

    const partnerSupplier = await this.prisma.partnerSupplier.create({
      data: {
        tradeName: dto.tradeName,
        companyName: dto.companyName,
        document: dto.document,
        stateRegistration: dto.stateRegistration,
        contact: dto.contact,
      },
    });

    await this.prisma.store.create({
      data: {
        name: partnerSupplier.tradeName,
        address: {
          create: {
            ...userDto.address,
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
      undefined,
    );

    return { partnerSupplier, user };
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

  async updateAccessPending(id: string, dto: UpdatePartnerSupplierDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        partnerSupplierId: id,
      },
    });

    if (!user) {
      throw new NotFoundException('Fornecedor parceiro não encontrado!');
    }

    await this.mailService.sendMail(
      user.email,
      dto.accessPending ? 'Cadastro reprovado' : 'Cadastro aprovado',
      dto.accessPending ? 'cadastro-reprovado.html' : 'cadastro-aprovado.html',
    );

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
    return this.prisma.user.findMany({
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
