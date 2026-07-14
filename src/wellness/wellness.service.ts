import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { DocumentType, Prisma } from '@prisma/client';
import { CreateWellnessDto } from './dto/create-wellness.dto';
import { UpdateWellnessDto } from './dto/update-wellness.dto';
import { CreateOfferingDto, UpdateOfferingDto } from './dto/offering.dto';
import { MailService } from '../mail/mail.service';

// ponytail: só comprimento por tipo; dígito verificador se o negócio pedir
function isValidDocument(type: DocumentType, value: string): boolean {
  const digits = (value ?? '').replace(/\D/g, '');
  return type === 'CNPJ' ? digits.length === 14 : digits.length === 11;
}

@Injectable()
export class WellnessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {}

  async create(dto: CreateWellnessDto, userDto: CreateUserDto) {
    const documentType = dto.documentType ?? 'CPF';
    if (!isValidDocument(documentType, dto.document)) {
      throw new BadRequestException(`${documentType} inválido.`);
    }

    const emailExists = await this.userService.checkIfEmailExists(
      userDto.email,
    );
    if (emailExists) {
      throw new ConflictException('Email já cadastrado.');
    }

    const hashedPassword = await this.userService.hashPassword(
      userDto.password,
    );

    return this.prisma.$transaction(async (tx) => {
      const wellness = await tx.wellness.create({
        data: {
          name: dto.name,
          document: dto.document,
          documentType,
          contact: dto.contact,
          description: dto.description,
          whatsappMessage: dto.whatsappMessage,
          logoUrl: dto.logoUrl,
          openingHours: dto.openingHours,
        },
      });

      const user = await this.userService.createUserWithRelation(
        userDto,
        undefined,
        undefined,
        undefined,
        tx,
        hashedPassword,
        wellness.id,
      );

      return { wellness, user };
    }).then(async (result) => {
      // ponytail: falha no e-mail não pode derrubar o cadastro
      try {
        await this.mailService.sendMail(
          result.user.email,
          'Cadastro recebido — em análise',
          'cadastro-em-analise.html',
          { username: result.wellness.name },
        );
      } catch (err) {
        console.error('Falha ao enviar e-mail de cadastro em análise:', err);
      }
      return result;
    });
  }

  async update(userId: string, dto: UpdateWellnessDto) {
    const wellnessId = await this.findWellnessIdByUserId(userId);
    const current = await this.prisma.wellness.findUnique({
      where: { id: wellnessId },
      select: { documentType: true },
    });

    // tipo efetivo: o que veio no payload, ou o já salvo
    const documentType = dto.documentType ?? current?.documentType ?? 'CPF';
    if (dto.document && !isValidDocument(documentType, dto.document)) {
      throw new BadRequestException(`${documentType} inválido.`);
    }

    return this.prisma.wellness.update({
      where: { id: wellnessId },
      data: {
        name: dto.name,
        document: dto.document,
        documentType: dto.documentType,
        contact: dto.contact,
        description: dto.description,
        whatsappMessage: dto.whatsappMessage,
        logoUrl: dto.logoUrl,
        openingHours: dto.openingHours,
      },
    });
  }

  async findAll(search?: string, page = 1, limit = 10, state?: string, city?: string) {
    return this.prisma.wellness.findMany({
      where: {
        status: 'APPROVED',
        isDeleted: false,
        user:
          state || city
            ? { address: { state: state || undefined, city: city || undefined } }
            : undefined,
        OR: search
          ? [
              { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { services: { some: { name: { contains: search, mode: Prisma.QueryMode.insensitive } } } },
            ]
          : undefined,
      },
      include: {
        services: { orderBy: { name: 'asc' } },
        user: { select: { profileImage: true, address: true } },
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findOne(id: string) {
    const wellness = await this.prisma.wellness.findUnique({
      where: { id },
      include: {
        services: { orderBy: { name: 'asc' } },
        user: { select: { profileImage: true, address: true } },
      },
    });
    if (!wellness) throw new NotFoundException('Parceiro wellness não encontrado.');
    return wellness;
  }

  async findMe(userId: string) {
    const wellnessId = await this.findWellnessIdByUserId(userId);
    return this.findOne(wellnessId);
  }

  // ===== Serviços (offerings) do próprio wellness =====

  async createOffering(userId: string, dto: CreateOfferingDto) {
    const wellnessId = await this.findWellnessIdByUserId(userId);
    return this.prisma.wellnessOffering.create({
      data: { ...dto, wellnessId },
    });
  }

  async updateOffering(userId: string, offeringId: string, dto: UpdateOfferingDto) {
    await this.assertOwnsOffering(userId, offeringId);
    return this.prisma.wellnessOffering.update({
      where: { id: offeringId },
      data: dto,
    });
  }

  async deleteOffering(userId: string, offeringId: string) {
    await this.assertOwnsOffering(userId, offeringId);
    return this.prisma.wellnessOffering.delete({ where: { id: offeringId } });
  }

  // ===== Favoritos (profissional) =====

  async toggleFavorite(userId: string, wellnessId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { professional: { include: { favoriteWellness: { select: { id: true } } } } },
    });
    if (!user?.professional) {
      throw new NotFoundException('Profissional não encontrado para este usuário.');
    }

    const isFavorited = user.professional.favoriteWellness.some(
      (w) => w.id === wellnessId,
    );

    return this.prisma.professional.update({
      where: { id: user.professional.id },
      data: {
        favoriteWellness: isFavorited
          ? { disconnect: { id: wellnessId } }
          : { connect: { id: wellnessId } },
      },
    });
  }

  private async findWellnessIdByUserId(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { wellnessId: true },
    });
    if (!user?.wellnessId) {
      throw new NotFoundException('Parceiro wellness não encontrado.');
    }
    return user.wellnessId;
  }

  private async assertOwnsOffering(userId: string, offeringId: string) {
    const wellnessId = await this.findWellnessIdByUserId(userId);
    const offering = await this.prisma.wellnessOffering.findUnique({
      where: { id: offeringId },
      select: { wellnessId: true },
    });
    if (!offering) throw new NotFoundException('Serviço não encontrado.');
    if (offering.wellnessId !== wellnessId) {
      throw new ForbiddenException('Este serviço não pertence a você.');
    }
  }
}
