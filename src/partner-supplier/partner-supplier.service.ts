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

    const partnerSupplier = await this.prisma.partnerSupplier.create({
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

  async toggleAccessPending(id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        partnerSupplierId: id,
      },
      include: {
        partnerSupplier: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Fornecedor parceiro não encontrado!');
    }

    if (!user.partnerSupplier) {
      throw new NotFoundException('Fornecedor parceiro não encontrado!');
    }

    const currentAccessPending = user.partnerSupplier.accessPending;
    const newAccessPending = !currentAccessPending;

    await this.mailService.sendMail(
      user.email,
      newAccessPending ? 'Cadastro reprovado' : 'Cadastro aprovado',
      newAccessPending ? 'cadastro-reprovado.html' : 'cadastro-aprovado.html',
      {
        username: getUsername(user),
      },
    );

    return this.prisma.partnerSupplier.update({
      where: { id },
      data: {
        accessPending: newAccessPending,
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
