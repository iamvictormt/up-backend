import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from 'src/auth/dto/login.dto';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { getUsername } from 'src/ultis';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from './constant/admin-datas';
import { CreateEventDto } from 'src/event/dto/create-event.dto';
import { DashboardStatistics } from './types/DashboardStatistics';
import { RecentActivity } from './types/RecentActivity';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  async findAllPartnerSuppliers() {
    return this.prisma.partnerSupplier.findMany({
      include: {
        store: {
          include: {
            address: true,
          },
        },
      },
    });
  }

  adminLogin(loginDto: LoginDto) {
    const { email, password } = loginDto;

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      throw new UnauthorizedException('Credenciais de administrador inválidas');
    }

    const payload = {
      sub: 'admin',
      email: ADMIN_EMAIL,
      role: 'admin',
    };

    const token = this.jwtService.sign(payload, { expiresIn: '168h' });

    return {
      token,
      user: {
        id: 'admin',
        email: ADMIN_EMAIL,
        role: 'admin',
      },
    };
  }

  async deletePartnerSupplier(id: string) {
    return this.prisma.$transaction(async (tx) => {
      // Apaga subscription
      await tx.subscription.deleteMany({
        where: { partnerSupplierId: id },
      });

      // Apaga usuário vinculado
      await tx.user.deleteMany({
        where: { partnerSupplierId: id },
      });

      // Apaga endereço vinculado à loja
      await tx.address.deleteMany({
        where: {
          stores: {
            some: {
              partnerId: id,
            },
          },
        },
      });

      // Apaga loja
      await tx.store.deleteMany({
        where: { partnerId: id },
      });

      // Finalmente, apaga o PartnerSupplier
      return tx.partnerSupplier.delete({
        where: { id },
      });
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

  async findAllRecommendedProfessionals() {
    return this.prisma.recommendedProfessional.findMany({
      include: {
        address: true,
        socialMedia: true,
        availableDays: true,
      },
    });
  }

  async createEvent(dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        name: dto.name,
        description: dto.description,
        date: new Date(dto.date),
        type: dto.type,
        points: dto.points,
        totalSpots: dto.totalSpots,
        store: {
          connect: { id: dto.storeId },
        },
        address: {
          create: dto.address,
        },
      },
      include: {
        address: true,
        store: true,
      },
    });
  }

  async findEvents() {
    return await this.prisma.event.findMany({
      where: { isActive: true },
      include: { address: true, store: true, participants: true },
    });
  }

  async findStores() {
    return this.prisma.store.findMany({
      include: {
        address: true,
        products: true,
        events: {
          include: {
            address: true,
          },
        },
      },
    });
  }

  async getEventParticipants(eventId: string) {
    return await this.prisma.eventRegistration.findMany({
      where: {
        eventId,
      },
      include: {
        professional: true,
      },
      orderBy: { registeredAt: 'asc' },
    });
  }

  async checkInEvente(eventId: string, professionalId: string) {
    const registration = await this.prisma.eventRegistration.findFirst({
      where: { eventId, professionalId },
    });

    if (!registration) throw new NotFoundException('Inscrição não encontrada');
    if (registration.checkedIn)
      throw new BadRequestException('Check-in já realizado');

    return this.prisma.eventRegistration.update({
      where: { id: registration.id },
      data: {
        checkedIn: true,
        checkedInAt: new Date(),
      },
    });
  }

  async toggleEvent(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }

    return this.prisma.event.update({
      where: { id: eventId },
      data: { isActive: !event.isActive },
    });
  }

  async getStatistics(): Promise<DashboardStatistics> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [
      totalUsers,
      totalProfessionals,
      totalPartnerSuppliers,
      totalEventsThisMonth,
      totalRecommendedProfessionals,
      totalPosts,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: { professionalId: { not: null } },
      }),
      this.prisma.user.count({
        where: { partnerSupplierId: { not: null } },
      }),
      this.prisma.event.count({
        where: {
          date: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth,
          },
        },
      }),
      this.prisma.recommendedProfessional.count({
        where: { isActive: true },
      }),
      this.prisma.post.count(),
    ]);

    return {
      totalUsers,
      totalProfessionals,
      totalPartnerSuppliers,
      totalEventsThisMonth,
      totalRecommendedProfessionals,
      totalPosts,
    };
  }

  async getRecentActivities(): Promise<RecentActivity[]> {
    const recentUsers = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, email: true, createdAt: true },
    });

    const recentProfessionals = await this.prisma.professional.findMany({
      orderBy: { id: 'desc' },
      take: 5,
      select: { id: true, name: true },
    });

    const recentPosts = await this.prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, title: true, createdAt: true },
    });

    const activities: RecentActivity[] = [
      ...recentUsers.map((u) => ({
        type: 'User',
        description: u.email,
        date: u.createdAt,
      })),
      ...recentProfessionals.map((p) => ({
        type: 'Professional',
        description: p.name,
        date: new Date(),
      })),
      ...recentPosts.map((p) => ({
        type: 'Post',
        description: p.title,
        date: p.createdAt,
      })),
    ];

    activities.sort((a, b) => b.date.getTime() - a.date.getTime());

    return activities.slice(0, 5);
  }

  /*

  // Métodos para Profissionais Recomendados
  async getRecommendedProfessionals() {
    return this.prisma.professional.findMany({
      where: {
        recommended: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        specialties: true,
        address: true,
      },
    });
  }

  async toggleRecommendedProfessional(id: string) {
    const professional = await this.prisma.professional.findUnique({
      where: { id },
    });

    if (!professional) {
      throw new NotFoundException('Profissional não encontrado!');
    }

    return this.prisma.professional.update({
      where: { id },
      data: {
        recommended: !professional.recommended,
      },
    });
  }

  // Métodos para Eventos
  async getAllEvents() {
    return this.prisma.event.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async approveEvent(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        creator: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Evento não encontrado!');
    }

    const updatedEvent = await this.prisma.event.update({
      where: { id },
      data: {
        approved: true,
      },
    });

    // Enviar email de aprovação para o criador do evento
    if (event.creator) {
      await this.mailService.sendMail(
        event.creator.email,
        'Evento aprovado',
        'evento-aprovado.html',
        {
          username: getUsername(event.creator),
          eventTitle: event.title,
        },
      );
    }

    return updatedEvent;
  }

  async deleteEvent(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        creator: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Evento não encontrado!');
    }

    // Enviar email de notificação para o criador do evento
    if (event.creator) {
      await this.mailService.sendMail(
        event.creator.email,
        'Evento removido',
        'evento-removido.html',
        {
          username: getUsername(event.creator),
          eventTitle: event.title,
        },
      );
    }

    return this.prisma.event.delete({
      where: { id },
    });
  }

  // Métodos para Benefícios
  async getAllBenefits() {
    return this.prisma.benefit.findMany({
      include: {
        partnerSupplier: {
          select: {
            id: true,
            name: true,
            store: {
              select: {
                name: true,
                category: true,
              },
            },
          },
        },
        _count: {
          select: {
            usedBy: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async toggleBenefit(id: string) {
    const benefit = await this.prisma.benefit.findUnique({
      where: { id },
    });

    if (!benefit) {
      throw new NotFoundException('Benefício não encontrado!');
    }

    return this.prisma.benefit.update({
      where: { id },
      data: {
        active: !benefit.active,
      },
    });
  }

  async deleteBenefit(id: string) {
    const benefit = await this.prisma.benefit.findUnique({
      where: { id },
      include: {
        partnerSupplier: {
          include: {
            users: true,
          },
        },
      },
    });

    if (!benefit) {
      throw new NotFoundException('Benefício não encontrado!');
    }

    return this.prisma.benefit.delete({
      where: { id },
    });
  }
  */
}
