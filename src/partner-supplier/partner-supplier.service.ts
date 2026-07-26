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
import { Prisma } from '@prisma/client';

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

    const hashedPassword = await this.userService.hashPassword(
      userDto.password,
    );

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
    }).then(async (result) => {
      // ponytail: falha no e-mail não pode derrubar o cadastro
      try {
        await this.mailService.sendMail(
          result.user.email,
          'Cadastro recebido — em análise',
          'cadastro-em-analise.html',
          { username: result.partnerSupplier.tradeName },
        );
      } catch (err) {
        console.error('Falha ao enviar e-mail de cadastro em análise:', err);
      }
      return result;
    });
  }

  async update(userId: string, dto: UpdatePartnerSupplierDto) {
    const user = await this.userService.findOne(userId);

    if (!user || !user.partnerSupplier) {
      throw new NotFoundException('Fornecedor parceiro não encontrado!');
    }

    return this.prisma.partnerSupplier.update({
      where: { id: user.partnerSupplier.id },
      data: {
        tradeName: dto.tradeName,
        companyName: dto.companyName,
        document: dto.document,
        stateRegistration: dto.stateRegistration,
        contact: dto.contact,
        type: dto.type as any,
      },
    });
  }

  async findAll(
    type?: string,
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

    const suppliers = await this.prisma.partnerSupplier.findMany({
      where: {
        status: 'APPROVED',
        isDeleted: false,
        type: type ? (type as any) : undefined,
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
        subscription: { select: { planType: true, subscriptionStatus: true } },
      },
    });

    // ponytail: ordena por tier de plano (PREMIUM>GOLD>SILVER>sem plano ativo) e
    // depois por nome, e pagina em memória — planType é string sem ordem de tier
    // e a lista é paginada, então o orderBy do banco não resolve.
    // Ceiling: carrega todos os parceiros aprovados do filtro. Se a base crescer
    // muito, migrar pra uma coluna planRank numérica + orderBy/skip/take no banco.
    const planRank: Record<string, number> = { PREMIUM: 0, GOLD: 1, SILVER: 2 };
    const rankOf = (s: (typeof suppliers)[number]) => {
      const active =
        s.subscription?.subscriptionStatus === 'ACTIVE' ||
        s.subscription?.subscriptionStatus === 'TRIALING';
      if (!active) return 99;
      return planRank[s.subscription!.planType] ?? 98;
    };

    suppliers.sort((a, b) => {
      const diff = rankOf(a) - rankOf(b);
      if (diff !== 0) return diff;
      return (a.store?.name ?? '').localeCompare(b.store?.name ?? '', 'pt', {
        sensitivity: 'base',
      });
    });

    const start = (page - 1) * limit;
    return suppliers.slice(start, start + limit);
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
