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
import { CreateRecommendedProfessionalDto } from 'src/recommended-professional/dto/create-recommended-professional.dto';
import { UpdateWellnessDto } from 'src/wellness/dto/update-wellness.dto';
import { UpdateRecommendedProfessionalDto } from 'src/recommended-professional/dto/update-recommended-professional.dto';
import { UpdateEventDto } from 'src/event/dto/update-event.dto';
import { PointsService } from 'src/points/points.service';
import { GrantTrialDto } from './dto/grant-trial.dto';
import { FindAllProfessionalsDto } from './dto/find-all-professionals.dto';
import { UpdateProfessionalDto } from 'src/professional/dto/update-professional.dto';
import { UpdatePartnerSupplierDto } from 'src/partner-supplier/dto/update-partner-supplier.dto';
import { PartnerType, RedemptionStatus, RegistrationStatus } from '@prisma/client';
import { CreateStoreDto } from 'src/store/dto/create-store.dto';
import { UpdateStoreDto } from 'src/store/dto/update-store.dto';
import { CreateProductDto } from 'src/product/dto/create-product.dto';
import { UpdateProductDto } from 'src/product/dto/update-product.dto';
import { CreateProfessionDto } from 'src/profession/dto/create-profession.dto';
import { UpdateProfessionDto } from 'src/profession/dto/update-profession.dto';
import { CreateStoreCategoryDto } from 'src/store-category/dto/create-store-category.dto';
import { UpdateStoreCategoryDto } from 'src/store-category/dto/update-store-category.dto';
import { CreateWellnessCategoryDto } from 'src/wellness-category/dto/create-wellness-category.dto';
import { UpdateWellnessCategoryDto } from 'src/wellness-category/dto/update-wellness-category.dto';
import { CreateCommunityDto } from 'src/community/dto/create-community.dto';
import { UpdateCommunityDto } from 'src/community/dto/update-community.dto';
import { CreatePostDTO } from 'src/post/dto/create-post.dto';
import { UpdatePostDto } from 'src/post/dto/update-post.dto';
import { CreateReportDto } from 'src/report/dto/create-report.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly pointsService: PointsService,
  ) {}

  async findAllProfessionals(dto: FindAllProfessionalsDto) {
    const {
      page = 1,
      limit = 10,
      search,
      level,
      professionId,
      verified,
      orderBy = 'createdAt',
      order = 'desc',
    } = dto;

    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;

    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {
      user: {
        isDeleted: false,
      },
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { document: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (level) {
      where.level = level;
    }

    if (professionId) {
      where.professionId = professionId;
    }

    if (verified !== undefined) {
      where.verified = verified;
    }

    const [total, data] = await Promise.all([
      this.prisma.professional.count({ where }),
      this.prisma.professional.findMany({
        where,
        skip,
        take: limitNumber, 
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profileImage: true,
              createdAt: true,
              address: true,
            },
          },
          profession: true,
          social: true,
          _count: {
            select: {
              eventRegistrations: true,
              workshops: true,
              redemptions: true,
            },
          },
        },
        orderBy: {
          [orderBy]: order,
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    };
  }

  async updateProfessional(id: string, data: UpdateProfessionalDto) {
    const professional = await this.prisma.professional.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!professional || professional.user?.isDeleted) {
      throw new NotFoundException('Profissional não encontrado!');
    }

    const { profileImage, userId, socialMediaId, ...professionalData } = data;

    return this.prisma.professional.update({
      where: { id },
      data: professionalData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profileImage: true,
            createdAt: true,
            address: true,
          },
        },
        profession: true,
        social: true,
        _count: {
          select: {
            eventRegistrations: true,
            workshops: true,
            redemptions: true,
          },
        },
      },
    });
  }

  async findAllProfessions() {
    return this.prisma.profession.findMany({
      include: {
        _count: {
          select: { professionals: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createProfession(dto: CreateProfessionDto) {
    return this.prisma.profession.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim(),
      },
      include: {
        _count: {
          select: { professionals: true },
        },
      },
    });
  }

  async updateProfession(id: string, dto: UpdateProfessionDto) {
    const profession = await this.prisma.profession.findUnique({
      where: { id },
    });

    if (!profession) {
      throw new NotFoundException('Profissão não encontrada.');
    }

    return this.prisma.profession.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        description: dto.description?.trim(),
      },
      include: {
        _count: {
          select: { professionals: true },
        },
      },
    });
  }

  async deleteProfession(id: string) {
    const profession = await this.prisma.profession.findUnique({
      where: { id },
      include: {
        _count: {
          select: { professionals: true },
        },
      },
    });

    if (!profession) {
      throw new NotFoundException('Profissão não encontrada.');
    }

    if (profession._count.professionals > 0) {
      throw new BadRequestException(
        'Esta profissão está em uso. Remova ou altere os profissionais vinculados antes de excluir.',
      );
    }

    return this.prisma.profession.delete({ where: { id } });
  }

  async findAllStoreCategories() {
    return this.prisma.storeCategory.findMany({
      include: {
        _count: {
          select: { stores: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createStoreCategory(dto: CreateStoreCategoryDto) {
    return this.prisma.storeCategory.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim(),
      },
      include: {
        _count: {
          select: { stores: true },
        },
      },
    });
  }

  async updateStoreCategory(id: string, dto: UpdateStoreCategoryDto) {
    const category = await this.prisma.storeCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada.');
    }

    return this.prisma.storeCategory.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        description: dto.description?.trim(),
      },
      include: {
        _count: {
          select: { stores: true },
        },
      },
    });
  }

  async deleteStoreCategory(id: string) {
    const category = await this.prisma.storeCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { stores: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada.');
    }

    if (category._count.stores > 0) {
      throw new BadRequestException(
        'Esta categoria está em uso. Altere as lojas vinculadas antes de excluir.',
      );
    }

    return this.prisma.storeCategory.delete({ where: { id } });
  }

  async findAllWellnessCategories() {
    return this.prisma.wellnessCategory.findMany({
      include: {
        _count: {
          select: { wellnesses: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createWellnessCategory(dto: CreateWellnessCategoryDto) {
    return this.prisma.wellnessCategory.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim(),
      },
      include: {
        _count: {
          select: { wellnesses: true },
        },
      },
    });
  }

  async updateWellnessCategory(id: string, dto: UpdateWellnessCategoryDto) {
    const category = await this.prisma.wellnessCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada.');
    }

    return this.prisma.wellnessCategory.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        description: dto.description?.trim(),
      },
      include: {
        _count: {
          select: { wellnesses: true },
        },
      },
    });
  }

  async deleteWellnessCategory(id: string) {
    const category = await this.prisma.wellnessCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { wellnesses: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada.');
    }

    if (category._count.wellnesses > 0) {
      throw new BadRequestException(
        'Esta categoria está em uso. Altere os parceiros wellness vinculados antes de excluir.',
      );
    }

    return this.prisma.wellnessCategory.delete({ where: { id } });
  }

  async findAllCommunities() {
    return this.prisma.community.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCommunity(dto: CreateCommunityDto) {
    return this.prisma.community.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim(),
        color: dto.color,
        icon: dto.icon.trim(),
      },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });
  }

  async updateCommunity(id: string, dto: UpdateCommunityDto) {
    const community = await this.prisma.community.findUnique({
      where: { id },
    });

    if (!community) {
      throw new NotFoundException('Comunidade não encontrada.');
    }

    return this.prisma.community.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        description: dto.description?.trim(),
        color: dto.color,
        icon: dto.icon?.trim(),
      },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });
  }

  async deleteCommunity(id: string) {
    const community = await this.prisma.community.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!community) {
      throw new NotFoundException('Comunidade não encontrada.');
    }

    if (community._count.posts > 0) {
      throw new BadRequestException(
        'Esta comunidade possui publicações. Exclua ou mova as publicações antes de apagar a comunidade.',
      );
    }

    return this.prisma.community.delete({ where: { id } });
  }

  async findPostAuthors() {
    const users = await this.prisma.user.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        email: true,
        profileImage: true,
        professional: { select: { name: true } },
        partnerSupplier: { select: { tradeName: true } },
        loveDecoration: { select: { name: true } },
      },
      orderBy: { email: 'asc' },
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      profileImage: user.profileImage,
      name: getUsername(user),
    }));
  }

  async findAllPosts() {
    return this.prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            email: true,
            profileImage: true,
            professional: { select: { name: true } },
            partnerSupplier: { select: { tradeName: true } },
            loveDecoration: { select: { name: true } },
          },
        },
        community: true,
        postHashtags: {
          include: { hashtag: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPost(dto: CreatePostDTO) {
    const { hashtags, image, ...postData } = dto;

    return this.prisma.$transaction(async (tx) => {
      const post = await tx.post.create({
        data: {
          ...postData,
          title: postData.title.trim(),
          content: postData.content.trim(),
          attachedImage: postData.attachedImage?.trim() || image?.trim(),
        },
      });

      if (hashtags?.length) {
        for (const tag of hashtags) {
          const name = tag.trim();
          if (!name) continue;

          const hashtag = await tx.hashtag.upsert({
            where: { name },
            update: {},
            create: { name },
          });

          await tx.postHashtag.create({
            data: {
              postId: post.id,
              hashtagId: hashtag.id,
            },
          });
        }
      }

      return tx.post.findUnique({
        where: { id: post.id },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              profileImage: true,
              professional: { select: { name: true } },
              partnerSupplier: { select: { tradeName: true } },
              loveDecoration: { select: { name: true } },
            },
          },
          community: true,
          postHashtags: { include: { hashtag: true } },
          _count: { select: { likes: true, comments: true } },
        },
      });
    });
  }

  async updatePost(id: string, dto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new NotFoundException('Publicação não encontrada.');
    }

    const { hashtags, image, ...postData } = dto;

    return this.prisma.$transaction(async (tx) => {
      await tx.postHashtag.deleteMany({ where: { postId: id } });

      if (hashtags?.length) {
        for (const tag of hashtags) {
          const name = tag.trim();
          if (!name) continue;

          const hashtag = await tx.hashtag.upsert({
            where: { name },
            update: {},
            create: { name },
          });

          await tx.postHashtag.create({
            data: {
              postId: id,
              hashtagId: hashtag.id,
            },
          });
        }
      }

      await tx.post.update({
        where: { id },
        data: {
          ...postData,
          title: postData.title?.trim(),
          content: postData.content?.trim(),
          attachedImage: postData.attachedImage?.trim() || image?.trim(),
        },
      });

      return tx.post.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              profileImage: true,
              professional: { select: { name: true } },
              partnerSupplier: { select: { tradeName: true } },
              loveDecoration: { select: { name: true } },
            },
          },
          community: true,
          postHashtags: { include: { hashtag: true } },
          _count: { select: { likes: true, comments: true } },
        },
      });
    });
  }

  async deletePost(id: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new NotFoundException('Publicação não encontrada.');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.notification.deleteMany({ where: { postId: id } });
      await tx.like.deleteMany({ where: { postId: id } });
      await tx.comment.deleteMany({ where: { postId: id } });
      await tx.postHashtag.deleteMany({ where: { postId: id } });
      return tx.post.delete({ where: { id } });
    });
  }

  async findAllReports() {
    return this.prisma.report.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profileImage: true,
            professional: { select: { name: true } },
            partnerSupplier: { select: { tradeName: true } },
            loveDecoration: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createReport(dto: CreateReportDto) {
    if (!dto.userId) {
      throw new BadRequestException('Selecione o usuário denunciante.');
    }

    return this.prisma.report.create({
      data: {
        reason: dto.reason.trim(),
        description: dto.description?.trim(),
        targetId: dto.targetId,
        targetType: dto.targetType.trim(),
        user: { connect: { id: dto.userId } },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profileImage: true,
            professional: { select: { name: true } },
            partnerSupplier: { select: { tradeName: true } },
            loveDecoration: { select: { name: true } },
          },
        },
      },
    });
  }

  async updateReport(id: string, dto: Partial<CreateReportDto>) {
    const report = await this.prisma.report.findUnique({ where: { id } });

    if (!report) {
      throw new NotFoundException('Denúncia não encontrada.');
    }

    return this.prisma.report.update({
      where: { id },
      data: {
        reason: dto.reason?.trim(),
        description: dto.description?.trim(),
        targetId: dto.targetId,
        targetType: dto.targetType?.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profileImage: true,
            professional: { select: { name: true } },
            partnerSupplier: { select: { tradeName: true } },
            loveDecoration: { select: { name: true } },
          },
        },
      },
    });
  }

  async deleteReport(id: string) {
    const report = await this.prisma.report.findUnique({ where: { id } });

    if (!report) {
      throw new NotFoundException('Denúncia não encontrada.');
    }

    return this.prisma.report.delete({ where: { id } });
  }

  async toggleProfessionalVerification(id: string) {
    const professional = await this.prisma.professional.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!professional || professional.user?.isDeleted) {
      throw new NotFoundException('Profissional não encontrado!');
    }

    return this.updateProfessional(id, {
      verified: !professional.verified,
    });
  }

  async softDeleteProfessional(id: string) {
    const professional = await this.prisma.professional.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!professional) {
      throw new NotFoundException('Profissional não encontrado!');
    }

    if (!professional.user) {
      throw new BadRequestException(
        'Profissional sem usuário vinculado não pode ser desativado por esta ação.',
      );
    }

    const timestamp = Date.now();

    return this.prisma.user.update({
      where: { id: professional.user.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        email: `deleted_${timestamp}_${professional.user.email}`,
      },
    });
  }

  async findAllPartnerSuppliers() {
    await this.expireStaleTrials();
    return this.prisma.partnerSupplier.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        store: {
          include: {
            address: true,
            products: {
              orderBy: [{ featured: 'desc' }, { name: 'asc' }],
            },
            events: {
              include: {
                address: true,
              },
              orderBy: {
                date: 'desc',
              },
            },
            _count: {
              select: {
                products: true,
                events: true,
              },
            },
          },
        },
        subscription: true,
        user: {
          select: {
            id: true,
            email: true,
            profileImage: true,
            createdAt: true,
            address: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updatePartnerSupplier(id: string, data: UpdatePartnerSupplierDto) {
    const partner = await this.prisma.partnerSupplier.findUnique({
      where: { id },
    });

    if (!partner || partner.isDeleted) {
      throw new NotFoundException('Fornecedor parceiro não encontrado!');
    }

    const { profileImage, type, ...partnerData } = data;

    return this.prisma.partnerSupplier.update({
      where: { id },
      data: {
        ...partnerData,
        type: type ? (type.toUpperCase() as PartnerType) : undefined,
      },
      include: {
        store: {
          include: {
            address: true,
            products: {
              orderBy: [{ featured: 'desc' }, { name: 'asc' }],
            },
            events: {
              include: {
                address: true,
              },
              orderBy: {
                date: 'desc',
              },
            },
            _count: {
              select: {
                products: true,
                events: true,
              },
            },
          },
        },
        subscription: true,
        user: {
          select: {
            id: true,
            email: true,
            profileImage: true,
            createdAt: true,
            address: true,
          },
        },
      },
    });
  }

  async createStore(dto: CreateStoreDto) {
    const partner = await this.prisma.partnerSupplier.findUnique({
      where: { id: dto.partnerId },
      include: { store: true },
    });

    if (!partner || partner.isDeleted) {
      throw new NotFoundException('Fornecedor parceiro não encontrado!');
    }

    if (partner.store) {
      throw new BadRequestException('Este lojista já possui uma loja.');
    }

    return this.prisma.store.create({
      data: {
        name: dto.name,
        description: dto.description,
        website: dto.website,
        openingHours: dto.openingHours,
        logoUrl: dto.logoUrl,
        partner: {
          connect: { id: dto.partnerId },
        },
        category: dto.categoryId
          ? { connect: { id: dto.categoryId } }
          : undefined,
        address: {
          create: {
            ...dto.address,
          },
        },
      },
      include: {
        address: true,
        products: true,
        events: {
          include: {
            address: true,
          },
        },
        partner: {
          include: {
            subscription: true,
          },
        },
      },
    });
  }

  async updateStore(id: string, dto: UpdateStoreDto) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        partner: true,
      },
    });

    if (!store || store.partner.isDeleted) {
      throw new NotFoundException('Loja não encontrada!');
    }

    return this.prisma.store.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        website: dto.website,
        openingHours: dto.openingHours,
        logoUrl: dto.logoUrl,
        category:
          dto.categoryId === undefined
            ? undefined
            : dto.categoryId
              ? { connect: { id: dto.categoryId } }
              : { disconnect: true },
        address: dto.address
          ? {
              update: {
                ...dto.address,
              },
            }
          : undefined,
      },
      include: {
        address: true,
        products: {
          orderBy: [{ featured: 'desc' }, { name: 'asc' }],
        },
        events: {
          include: {
            address: true,
          },
          orderBy: {
            date: 'desc',
          },
        },
        partner: {
          include: {
            subscription: true,
          },
        },
      },
    });
  }

  async createStoreProduct(storeId: string, dto: CreateProductDto) {
    await this.ensureActiveStore(storeId);

    return this.prisma.product.create({
      data: {
        ...dto,
        storeId,
      },
    });
  }

  async updateStoreProduct(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        store: {
          include: {
            partner: true,
          },
        },
      },
    });

    if (!product || product.store.partner.isDeleted) {
      throw new NotFoundException('Produto não encontrado!');
    }

    return this.prisma.product.update({
      where: { id },
      data: dto,
    });
  }

  async deleteStoreProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        store: {
          include: {
            partner: true,
          },
        },
      },
    });

    if (!product || product.store.partner.isDeleted) {
      throw new NotFoundException('Produto não encontrado!');
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return { message: 'Produto excluído com sucesso' };
  }

  private async ensureActiveStore(storeId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: {
        partner: true,
      },
    });

    if (!store || store.partner.isDeleted) {
      throw new NotFoundException('Loja não encontrada!');
    }

    return store;
  }

  async findAllPhysicalSales() {
    return this.prisma.physicalSale.findMany({
      include: {
        partner: true,
        professional: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updatePartnerPointsLimit(id: string, pointsLimit: number) {
    const partner = await this.prisma.partnerSupplier.findUnique({
      where: { id },
    });

    if (!partner) {
      throw new NotFoundException('Fornecedor parceiro não encontrado!');
    }

    return this.prisma.partnerSupplier.update({
      where: { id },
      data: { pointsLimit },
    });
  }

  async togglePartnerVerification(id: string) {
    const partner = await this.prisma.partnerSupplier.findUnique({
      where: { id },
    });

    if (!partner) {
      throw new NotFoundException('Fornecedor parceiro não encontrado!');
    }

    return this.prisma.partnerSupplier.update({
      where: { id },
      data: {
        isVerified: !partner.isVerified,
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

  async softDeletePartnerSupplier(id: string) {
    const partner = await this.prisma.partnerSupplier.findUnique({
      where: { id },
      include: {
        user: true,
        store: true,
      },
    });

    if (!partner) {
      throw new NotFoundException('Fornecedor parceiro não encontrado!');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const timestamp = Date.now();

      // Desativa todos os usuários vinculados
      if (partner.user) {
        await tx.user.update({
          where: { id: partner.user.id },
          data: {
            isDeleted: true,
            deletedAt: new Date(),
            email: `deleted_${timestamp}_${partner.user.email}`,
          },
        });
      }

      await tx.user.updateMany({
        where: { partnerSupplierId: id, isDeleted: false },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      // Cancela assinaturas
      await tx.subscription.updateMany({
        where: { partnerSupplierId: id },
        data: {
          subscriptionStatus: 'CANCELED',
        },
      });

      // Desativa a loja vinculada, se existir
      if (partner.store) {
        // Como o modelo Store não possui isDeleted, poderíamos considerar adicionar
        // ou simplesmente garantir que ela não apareça nos resultados.
        // Por enquanto, seguiremos a recomendação do review de "desativar".
        // Se não houver campo isActive/isDeleted na Store, a própria desativação do Partner
        // já deve filtrar na maioria das queries (visto em StoreService.findAll).
      }

      // Desativa o lojista parceiro
      return tx.partnerSupplier.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });
    });

    // Envia email de notificação após sucesso da transação
    if (partner.user) {
      await this.mailService.sendMail(
        partner.user.email,
        'Conta de lojista desativada',
        'conta-excluida.html',
        {
          username: getUsername(partner.user),
        },
      );
    }

    return result;
  }

  async approvePartnerSupplier(id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        partnerSupplierId: id,
      },
      include: {
        partnerSupplier: true,
      },
    });

    if (!user || !user.partnerSupplier) {
      throw new NotFoundException('Fornecedor parceiro não encontrado!');
    }

    await this.mailService.sendMail(
      user.email,
      'Cadastro aprovado',
      'cadastro-aprovado.html',
      {
        username: getUsername(user),
        platformUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
      },
    );

    const approved = await this.prisma.partnerSupplier.update({
      where: { id },
      data: {
        status: 'APPROVED',
      },
    });

    // Acesso padrão pra todos: 3 meses de trial na aprovação, sem escolha de plano.
    // Só cria se ainda não houver assinatura (não sobrescreve Stripe ativa).
    const existing = await this.prisma.subscription.findUnique({
      where: { partnerSupplierId: id },
    });
    if (!existing) {
      const trialEnd = new Date();
      trialEnd.setMonth(trialEnd.getMonth() + 3);
      await this.applySubscription(
        { partnerSupplierId: id },
        {
          subscriptionStatus: 'TRIALING',
          planType: 'TRIAL',
          currentPeriodEnd: trialEnd,
          isManual: true,
        },
        'GRANTED',
        'system',
        'Período gratuito na aprovação',
      );
    }

    return approved;
  }

  async rejectPartnerSupplier(id: string, reason: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        partnerSupplierId: id,
      },
      include: {
        partnerSupplier: true,
      },
    });

    if (!user || !user.partnerSupplier) {
      throw new NotFoundException('Fornecedor parceiro não encontrado!');
    }

    await this.mailService.sendMail(
      user.email,
      'Cadastro reprovado',
      'cadastro-reprovado.html',
      {
        username: getUsername(user),
        reason,
      },
    );

    return this.prisma.$transaction(async (tx) => {
      const timestamp = Date.now();

      await tx.user.update({
        where: { id: user.id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          email: `deleted_${timestamp}_${user.email}`,
        },
      });

      return tx.partnerSupplier.update({
        where: { id },
        data: {
          status: 'REJECTED',
          isDeleted: true,
          deletedAt: new Date(),
        },
      });
    });
  }

  // ===== Wellness (entidade própria: aprovação sem plano) =====

  async findAllWellness() {
    await this.expireStaleTrials();
    return this.prisma.wellness.findMany({
      where: { isDeleted: false },
      include: {
        subscription: true,
        services: { orderBy: { name: 'asc' } },
        user: {
          select: {
            id: true,
            email: true,
            profileImage: true,
            createdAt: true,
            address: true,
          },
        },
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async updateWellness(id: string, data: UpdateWellnessDto) {
    const wellness = await this.prisma.wellness.findUnique({ where: { id } });

    if (!wellness || wellness.isDeleted) {
      throw new NotFoundException('Parceiro wellness não encontrado!');
    }

    // valida o documento conforme o tipo efetivo (payload ou o já salvo)
    const documentType = data.documentType ?? wellness.documentType;
    if (data.document) {
      const digits = data.document.replace(/\D/g, '');
      const expected = documentType === 'CNPJ' ? 14 : 11;
      if (digits.length !== expected) {
        throw new BadRequestException(`${documentType} inválido.`);
      }
    }

    const { profileImage, categoryId, ...wellnessData } = data;

    return this.prisma.wellness.update({
      where: { id },
      data: {
        ...wellnessData,
        category:
          categoryId === undefined
            ? undefined
            : categoryId
              ? { connect: { id: categoryId } }
              : { disconnect: true },
      },
      include: {
        services: { orderBy: { name: 'asc' } },
        category: true,
        user: {
          select: {
            id: true,
            email: true,
            profileImage: true,
            createdAt: true,
            address: true,
          },
        },
      },
    });
  }

  async approveWellness(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { wellnessId: id },
    });

    if (!user) {
      throw new NotFoundException('Parceiro wellness não encontrado!');
    }

    await this.mailService.sendMail(
      user.email,
      'Cadastro aprovado',
      'cadastro-aprovado.html',
      {
        username: getUsername(user),
        platformUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
      },
    );

    const approved = await this.prisma.wellness.update({
      where: { id },
      data: { status: 'APPROVED' },
    });

    // Mesmo trial padrão de 3 meses do lojista (wellness é isento de cobrança,
    // mas o período fica visível/gerenciável no admin).
    const existing = await this.prisma.subscription.findUnique({
      where: { wellnessId: id },
    });
    if (!existing) {
      const trialEnd = new Date();
      trialEnd.setMonth(trialEnd.getMonth() + 3);
      await this.applySubscription(
        { wellnessId: id },
        {
          subscriptionStatus: 'TRIALING',
          planType: 'TRIAL',
          currentPeriodEnd: trialEnd,
          isManual: true,
        },
        'GRANTED',
        'system',
        'Período gratuito na aprovação',
      );
    }

    return approved;
  }

  async rejectWellness(id: string, reason: string) {
    const user = await this.prisma.user.findFirst({
      where: { wellnessId: id },
    });

    if (!user) {
      throw new NotFoundException('Parceiro wellness não encontrado!');
    }

    await this.mailService.sendMail(
      user.email,
      'Cadastro reprovado',
      'cadastro-reprovado.html',
      {
        username: getUsername(user),
        reason,
      },
    );

    return this.prisma.$transaction(async (tx) => {
      const timestamp = Date.now();

      await tx.user.update({
        where: { id: user.id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          email: `deleted_${timestamp}_${user.email}`,
        },
      });

      return tx.wellness.update({
        where: { id },
        data: {
          status: 'REJECTED',
          isDeleted: true,
          deletedAt: new Date(),
        },
      });
    });
  }

  async softDeleteWellness(id: string) {
    const wellness = await this.prisma.wellness.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!wellness) {
      throw new NotFoundException('Parceiro wellness não encontrado!');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const timestamp = Date.now();

      if (wellness.user) {
        await tx.user.update({
          where: { id: wellness.user.id },
          data: {
            isDeleted: true,
            deletedAt: new Date(),
            email: `deleted_${timestamp}_${wellness.user.email}`,
          },
        });
      }

      return tx.wellness.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });
    });

    if (wellness.user) {
      await this.mailService.sendMail(
        wellness.user.email,
        'Conta desativada',
        'conta-excluida.html',
        {
          username: getUsername(wellness.user),
        },
      );
    }

    return result;
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

  async createRecommendedProfessional(data: CreateRecommendedProfessionalDto) {
    return await this.prisma.recommendedProfessional.create({
      data: {
        name: data.name,
        profession: data.profession,
        description: data.description,
        phone: data.phone,
        email: data.email,
        profileImage: data.profileImage,
        isActive: data.isActive ?? true,
        address: {
          create: {
            ...data.address,
          },
        },
        availableDays: data.availableDays
          ? {
              create: data.availableDays.map((day) => ({
                dayOfWeek: day,
              })),
            }
          : undefined,
        socialMedia: data.socialMedia
          ? {
              create: {
                instagram: data.socialMedia.instagram,
                linkedin: data.socialMedia.linkedin,
                whatsapp: data.socialMedia.whatsapp,
              },
            }
          : undefined,
      },
      include: {
        availableDays: true,
        socialMedia: true,
        address: true,
      },
    });
  }

  async updateRecommendedProfessional(
    id: string,
    data: UpdateRecommendedProfessionalDto,
  ) {
    const { socialMedia, availableDays, address, ...rest } = data;

    return this.prisma.recommendedProfessional.update({
      where: { id },
      data: {
        ...rest,

        address: address
          ? {
              update: {
                state: address.state,
                city: address.city,
                district: address.district,
                street: address.street,
                complement: address.complement,
                number: address.number,
                zipCode: address.zipCode,
              },
            }
          : undefined,

        socialMedia: socialMedia
          ? {
              upsert: {
                create: {
                  instagram: socialMedia.instagram,
                  linkedin: socialMedia.linkedin,
                  whatsapp: socialMedia.whatsapp,
                },
                update: {
                  instagram: socialMedia.instagram,
                  linkedin: socialMedia.linkedin,
                  whatsapp: socialMedia.whatsapp,
                },
              },
            }
          : undefined,

        availableDays: availableDays
          ? {
              deleteMany: {},
              createMany: {
                data: availableDays.map((dayOfWeek) => ({ dayOfWeek })),
              },
            }
          : undefined,
      },
      include: {
        address: true,
        socialMedia: true,
        availableDays: true,
      },
    });
  }

  async findOneRecommendedProfessional(id: string) {
    return await this.prisma.recommendedProfessional.findUnique({
      where: { id },
      include: {
        address: true,
        socialMedia: true,
        availableDays: true,
      },
    });
  }

  async toggleStatusRecommendedProfessional(id: string) {
    const professional = await this.findOneRecommendedProfessional(id);
    if (!professional) {
      throw new BadRequestException('Profissional não encontrado');
    }

    return await this.updateRecommendedProfessional(id, {
      isActive: !professional.isActive,
    });
  }

  async removeRecommendedProfessional(id: string) {
    await this.prisma.availableDay.deleteMany({
      where: { recommendedProfessionalId: id },
    });

    return await this.prisma.recommendedProfessional.delete({
      where: { id },
    });
  }

  async createEvent(dto: CreateEventDto) {
    let addressData: any;

    if (dto.address) {
      addressData = { create: dto.address };
    } else {
      const store = await this.prisma.store.findUnique({
        where: { id: dto.storeId },
        select: { addressId: true },
      });

      if (!store) {
        throw new NotFoundException('Loja não encontrada');
      }

      addressData = { connect: { id: store.addressId } };
    }

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
        address: addressData,
      },
      include: {
        address: true,
        store: true,
      },
    });
  }

  async updateEvent(id: string, data: UpdateEventDto) {
    const { address, storeId, ...eventData } = data; // extrai storeId e address

    const prismaUpdateData: any = {
      ...eventData,
    };

    if (address) {
      prismaUpdateData.address = {
        update: {
          state: address.state,
          city: address.city,
          district: address.district,
          street: address.street,
          complement: address.complement,
          number: address.number,
          zipCode: address.zipCode,
        },
      };
    }

    if (storeId) {
      prismaUpdateData.store = {
        connect: { id: storeId },
      };
    }

    return await this.prisma.event.update({
      where: { id },
      data: prismaUpdateData,
    });
  }

  async findEvents() {
    return await this.prisma.event.findMany({
      include: { address: true, store: true, participants: true },
    });
  }

  async findStores(order: 'asc' | 'desc' = 'asc') {
    return this.prisma.store.findMany({
      where: {
        partner: {
          isDeleted: false,
        },
      },
      include: {
        address: true,
        products: {
          orderBy: [{ featured: 'desc' }, { name: 'asc' }],
        },
        events: {
          include: {
            address: true,
          },
          orderBy: {
            date: 'asc',
          },
        },
        partner: {
          include: {
            subscription: true,
          },
        },
      },
      orderBy: {
        name: order,
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
      include: {
        event: true,
      },
    });

    if (!registration) throw new NotFoundException('Inscrição não encontrada');
    if (registration.checkedIn)
      throw new BadRequestException('Check-in já realiza``do');

    await this.pointsService.addPoints(
      professionalId,
      registration.event.points,
      `EVENTO-${eventId}`,
    );

    return await this.prisma.eventRegistration.update({
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

  async deleteEvent(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        participants: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }

    if (event.participants.some((participant) => participant.checkedIn)) {
      throw new BadRequestException(
        'Não é possível excluir eventos com check-in realizado. Desative o evento para preservar o histórico.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.eventRegistration.deleteMany({
        where: { eventId },
      });

      return tx.event.delete({
        where: { id: eventId },
      });
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
      totalWellnessPartners,
      totalEventsThisMonth,
      totalRecommendedProfessionals,
      totalPosts,
      totalPhysicalSales,
      pointsAggregate,
      totalProfessions,
      totalCommunities,
      totalReports,
      pendingPartnerSuppliers,
      pendingWellnessPartners,
      pendingBenefitRedemptions,
      postsThisMonth,
    ] = await Promise.all([
      this.prisma.user.count({
        where: { isDeleted: false },
      }),
      this.prisma.user.count({
        where: { professionalId: { not: null }, isDeleted: false },
      }),
      this.prisma.partnerSupplier.count({
        where: { type: PartnerType.SUPPLIER, isDeleted: false },
      }),
      this.prisma.wellness.count({
        where: { isDeleted: false },
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
      this.prisma.physicalSale.count(),
      this.prisma.physicalSale.aggregate({
        _sum: {
          points: true,
        },
        where: {
          redeemedAt: { not: null },
        },
      }),
      this.prisma.profession.count(),
      this.prisma.community.count(),
      this.prisma.report.count(),
      this.prisma.partnerSupplier.count({
        where: {
          type: PartnerType.SUPPLIER,
          status: RegistrationStatus.PENDING,
          isDeleted: false,
        },
      }),
      this.prisma.wellness.count({
        where: {
          status: RegistrationStatus.PENDING,
          isDeleted: false,
        },
      }),
      this.prisma.benefitRedemption.count({
        where: {
          status: RedemptionStatus.PENDING,
        },
      }),
      this.prisma.post.count({
        where: {
          createdAt: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth,
          },
        },
      }),
    ]);

    return {
      totalUsers,
      totalProfessionals,
      totalPartnerSuppliers,
      totalWellnessPartners,
      totalEventsThisMonth,
      totalRecommendedProfessionals,
      totalPosts,
      totalPhysicalSales,
      totalPointsAwardedPhysical: pointsAggregate._sum.points || 0,
      totalProfessions,
      totalCommunities,
      totalReports,
      pendingPartnerSuppliers,
      pendingWellnessPartners,
      pendingBenefitRedemptions,
      postsThisMonth,
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
      select: { id: true, name: true, createdAt: true },
    });

    const recentPosts = await this.prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, title: true, createdAt: true },
    });

    const activities: RecentActivity[] = [
      ...recentUsers.map((u) => ({
        type: 'User' as const,
        description: u.email,
        date: u.createdAt,
      })),
      ...recentProfessionals.map((p) => ({
        type: 'Professional' as const,
        description: p.name,
        date: p.createdAt,
      })),
      ...recentPosts.map((p) => ({
        type: 'Post' as const,
        description: p.title,
        date: p.createdAt,
      })),
    ];

    activities.sort((a, b) => b.date.getTime() - a.date.getTime());

    return activities.slice(0, 5);
  }

  // id pode ser de lojista (partnerSupplier) ou de wellness
  // "Flip preguiçoso": marca como EXPIRED os trials manuais cuja validade já
  // passou, e registra o evento no histórico. Chamado nas leituras (sem cron).
  private async expireStaleTrials() {
    const stale = await this.prisma.subscription.findMany({
      where: {
        isManual: true,
        subscriptionStatus: 'TRIALING',
        currentPeriodEnd: { lt: new Date() },
      },
    });

    for (const sub of stale) {
      await this.prisma.$transaction([
        this.prisma.subscription.update({
          where: { id: sub.id },
          data: { subscriptionStatus: 'EXPIRED' },
        }),
        this.prisma.subscriptionEvent.create({
          data: {
            partnerSupplierId: sub.partnerSupplierId,
            wellnessId: sub.wellnessId,
            eventType: 'EXPIRED',
            status: 'EXPIRED',
            planType: sub.planType,
            currentPeriodEnd: sub.currentPeriodEnd,
            source: 'system',
            note: 'Período gratuito encerrado',
          },
        }),
      ]);
    }
  }

  // Resolve o dono da assinatura por id (lojista OU wellness).
  private async resolveSubscriptionOwner(id: string) {
    const partner = await this.prisma.partnerSupplier.findUnique({
      where: { id },
      include: { subscription: true },
    });
    if (partner) {
      return { owner: { partnerSupplierId: id }, subscription: partner.subscription };
    }
    const wellness = await this.prisma.wellness.findUnique({
      where: { id },
      include: { subscription: true },
    });
    if (wellness) {
      return { owner: { wellnessId: id }, subscription: wellness.subscription };
    }
    throw new NotFoundException('Parceiro não encontrado!');
  }

  // Aplica o estado da assinatura E registra o evento no histórico (atômico).
  private async applySubscription(
    owner: { partnerSupplierId: string } | { wellnessId: string },
    data: {
      subscriptionStatus: string;
      planType: string;
      currentPeriodEnd: Date;
      isManual: boolean;
    },
    eventType: string,
    source = 'admin',
    note?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.upsert({
        where: owner as any,
        update: data as any,
        create: { ...owner, ...data } as any,
      });
      await tx.subscriptionEvent.create({
        data: {
          ...owner,
          eventType,
          status: data.subscriptionStatus,
          planType: data.planType,
          currentPeriodEnd: data.currentPeriodEnd,
          source,
          note,
        },
      });
      return subscription;
    });
  }

  async grantTrial(id: string, dto: GrantTrialDto) {
    const { owner, subscription } = await this.resolveSubscriptionOwner(id);

    if (
      subscription &&
      subscription.isManual &&
      subscription.subscriptionStatus === 'TRIALING' &&
      subscription.currentPeriodEnd > new Date() // expirado pode receber novo plano
    ) {
      throw new BadRequestException(
        'Este parceiro já possui um plano manual ativo.',
      );
    }

    const trialEnd = new Date();
    if (dto.unit === 'days') {
      trialEnd.setDate(trialEnd.getDate() + dto.duration);
    } else if (dto.unit === 'weeks') {
      trialEnd.setDate(trialEnd.getDate() + dto.duration * 7);
    } else if (dto.unit === 'months') {
      trialEnd.setMonth(trialEnd.getMonth() + dto.duration);
    }

    return this.applySubscription(
      owner,
      {
        subscriptionStatus: 'TRIALING',
        planType: dto.planType.toUpperCase(),
        currentPeriodEnd: trialEnd,
        isManual: true,
      },
      'GRANTED',
    );
  }

  // Edita plano ativo: muda tipo e/ou validade sem cancelar e reconceder.
  async editSubscription(
    id: string,
    dto: { planType?: string; currentPeriodEnd?: string },
  ) {
    const { owner, subscription } = await this.resolveSubscriptionOwner(id);
    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada!');
    }
    if (!subscription.isManual) {
      throw new BadRequestException(
        'Apenas assinaturas manuais podem ser editadas por aqui.',
      );
    }

    const periodEnd = dto.currentPeriodEnd
      ? new Date(dto.currentPeriodEnd)
      : subscription.currentPeriodEnd;
    if (Number.isNaN(periodEnd.getTime())) {
      throw new BadRequestException('Data de validade inválida.');
    }

    // Validade no futuro reativa (TRIALING); no passado, marca expirado.
    const status = periodEnd.getTime() > Date.now() ? 'TRIALING' : 'EXPIRED';

    return this.applySubscription(
      owner,
      {
        subscriptionStatus: status,
        planType: (dto.planType ?? subscription.planType).toUpperCase(),
        currentPeriodEnd: periodEnd,
        isManual: true,
      },
      'EDITED',
    );
  }

  // Estende o período somando meses à validade atual.
  async extendSubscription(id: string, dto: { months: number }) {
    const { owner, subscription } = await this.resolveSubscriptionOwner(id);
    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada!');
    }
    if (!subscription.isManual) {
      throw new BadRequestException(
        'Apenas assinaturas manuais podem ser estendidas por aqui.',
      );
    }
    if (!dto.months || dto.months <= 0) {
      throw new BadRequestException('Informe um número de meses maior que zero.');
    }

    // parte do maior entre validade atual e hoje (não "encolher" trial expirado)
    const base =
      subscription.currentPeriodEnd > new Date()
        ? new Date(subscription.currentPeriodEnd)
        : new Date();
    base.setMonth(base.getMonth() + dto.months);

    return this.applySubscription(
      owner,
      {
        subscriptionStatus: 'TRIALING',
        planType: subscription.planType,
        currentPeriodEnd: base,
        isManual: true,
      },
      'EXTENDED',
      'admin',
      `+${dto.months} mês(es)`,
    );
  }

  // id pode ser de lojista (partnerSupplier) ou de wellness
  async cancelManualSubscription(id: string) {
    const { owner, subscription } = await this.resolveSubscriptionOwner(id);

    if (!subscription) {
      throw new NotFoundException('Assinatura não encontrada!');
    }
    if (!subscription.isManual) {
      throw new BadRequestException(
        'Apenas assinaturas manuais podem ser canceladas por aqui.',
      );
    }

    return this.applySubscription(
      owner,
      {
        subscriptionStatus: 'CANCELED',
        planType: subscription.planType,
        currentPeriodEnd: new Date(),
        isManual: true,
      },
      'CANCELED',
    );
  }

  async getSubscriptionHistory(id: string) {
    await this.resolveSubscriptionOwner(id); // 404 se não existir
    return this.prisma.subscriptionEvent.findMany({
      where: { OR: [{ partnerSupplierId: id }, { wellnessId: id }] },
      orderBy: { createdAt: 'desc' },
    });
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
