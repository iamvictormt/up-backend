import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { Prisma, PartnerType, DocumentType } from '@prisma/client';

export interface CreatePartnerData {
  tradeName: string;
  companyName?: string;
  document: string;
  documentType: DocumentType;
  stateRegistration?: string;
  contact?: string;
  type: PartnerType;
}

export interface UpdatePartnerData {
  tradeName?: string;
  companyName?: string;
  document?: string;
  documentType?: DocumentType;
  stateRegistration?: string;
  contact?: string;
}

@Injectable()
export class PartnerBaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async create(data: CreatePartnerData, userDto: CreateUserDto) {
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
      const partnerSupplier = await tx.partnerSupplier.create({
        data: {
          tradeName: data.tradeName,
          companyName: data.companyName,
          document: data.document,
          documentType: data.documentType,
          stateRegistration: data.stateRegistration,
          contact: data.contact,
          type: data.type,
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

  async update(partnerId: string, data: UpdatePartnerData) {
    return this.prisma.partnerSupplier.update({
      where: { id: partnerId },
      data: {
        tradeName: data.tradeName,
        companyName: data.companyName,
        document: data.document,
        documentType: data.documentType,
        stateRegistration: data.stateRegistration,
        contact: data.contact,
      },
    });
  }

  async findPartnerIdByUserId(userId: string) {
    const user = await this.userService.findOne(userId);
    if (!user || !user.partnerSupplier) {
      throw new NotFoundException('Parceiro não encontrado!');
    }
    return user.partnerSupplier.id;
  }

  async findAll(
    type?: PartnerType,
    search?: string,
    page = 1,
    limit = 10,
    state?: string,
    city?: string,
  ) {
    const storeFilter =
      state || city
        ? {
            is: {
              address: {
                state: state || undefined,
                city: city || undefined,
              },
            },
          }
        : undefined;

    return this.prisma.partnerSupplier.findMany({
      where: {
        status: 'APPROVED',
        isDeleted: false,
        type: type ?? undefined,
        store: storeFilter,
        OR: search
          ? [
              {
                tradeName: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                companyName: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
              {
                store: {
                  is: {
                    name: {
                      contains: search,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                },
              },
              {
                store: {
                  is: {
                    description: {
                      contains: search,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                },
              },
              {
                store: {
                  is: {
                    products: {
                      some: {
                        name: {
                          contains: search,
                          mode: Prisma.QueryMode.insensitive,
                        },
                      },
                    },
                  },
                },
              },
            ]
          : undefined,
      },
      include: {
        store: {
          include: {
            address: true,
            products: {
              orderBy: [{ featured: 'desc' }, { name: 'asc' }],
            },
          },
        },
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findOne(id: string) {
    return this.prisma.partnerSupplier.findUnique({
      where: { id },
      include: { store: { include: { address: true } } },
    });
  }

  async findProfessionalIdByUserId(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { professional: true },
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
    return this.prisma.professional.update({
      where: { id: professionalId },
      data: {
        favoritePartners: isFavorited
          ? { disconnect: { id: partnerId } }
          : { connect: { id: partnerId } },
      },
    });
  }

  async findPending(type?: PartnerType) {
    return this.prisma.user.findMany({
      where: {
        isDeleted: false,
        partnerSupplierId: { not: null },
        partnerSupplier: {
          status: 'PENDING',
          isDeleted: false,
          type: type ?? undefined,
        },
      },
      include: { partnerSupplier: true },
    });
  }
}
