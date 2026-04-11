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
          type: (dto.type as any) || 'SUPPLIER',
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

  async findAll(type?: string) {
    return this.prisma.partnerSupplier.findMany({
      where: {
        status: 'APPROVED',
        isDeleted: false,
        type: type ? (type as any) : undefined,
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

  async findProfessionalIdByUserId(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        professional: true,
      },
    });

    if (!user || !user.professional) {
      throw new NotFoundException(
        'Profissional não encontrado para este usuário.',
      );
    }

    return user.professional.id;
  }

  async toggleFavorite(professionalId: string, partnerId: string) {
    const professional = await this.prisma.professional.findUnique({
      where: { id: professionalId },
      include: { favoritePartners: { select: { id: true } } },
    });

    if (!professional) {
      throw new NotFoundException('Profissional não encontrado');
    }

    const isFavorited = professional.favoritePartners.some(
      (p) => p.id === partnerId,
    );

    if (isFavorited) {
      return this.prisma.professional.update({
        where: { id: professionalId },
        data: {
          favoritePartners: {
            disconnect: { id: partnerId },
          },
        },
      });
    } else {
      return this.prisma.professional.update({
        where: { id: professionalId },
        data: {
          favoritePartners: {
            connect: { id: partnerId },
          },
        },
      });
    }
  }

  async findPending() {
    return await this.prisma.user.findMany({
      where: {
        isDeleted: false,
        partnerSupplierId: {
          not: null,
        },
        partnerSupplier: {
          status: 'PENDING',
          isDeleted: false,
        },
      },
      include: {
        partnerSupplier: true,
      },
    });
  }
}
