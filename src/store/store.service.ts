import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import now = jest.now;
import { Prisma, Store } from '@prisma/client';

@Injectable()
export class StoreService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateStoreDto) {
    const store = await this.prisma.store.create({
      data: {
        name: dto.name,
        description: dto.description,
        website: dto.website,
        openingHours: dto.openingHours,
        logoUrl: dto.logoUrl,
        partner: {
          connect: { id: dto.partnerId },
        },
        address: {
          create: {
            ...dto.address,
          },
        },
      },
      include: {
        address: true,
      },
    });

    return { store };
  }

  async update(userId: string, dto: UpdateStoreDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        partnerSupplier: {
          include: { store: true },
        },
      },
    });

    const store = user?.partnerSupplier?.store;

    if (!store) {
      throw new NotFoundException('Loja não encontrada para esse usuário!');
    }

    return this.prisma.store.update({
      where: { id: store.id },
      data: {
        name: dto.name,
        description: dto.description,
        website: dto.website,
        openingHours: dto.openingHours,
        logoUrl: dto.logoUrl,
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
        products: true,
        events: {
          include: {
            address: true,
          },
        },
      },
    });
  }

  async findMyStore(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        partnerSupplier: {
          include: { store: true },
        },
      },
    });

    const store = user?.partnerSupplier?.store;

    if (!store) {
      return null;
    }

    return this.prisma.store.findUnique({
      where: { id: store.id },
      include: {
        address: true,
        products: {
          orderBy: [{ featured: 'desc' }, { name: 'asc' }],
        },
        events: {
          where: {
            isActive: true,
            date: {
              gte: new Date(Date.now()),
            },
          },
          include: {
            address: true,
          },
          orderBy: {
            date: 'asc',
          },
        },
      },
    });
  }

  async findAll(search?: string, page = 1, limit = 10) {
    return this.prisma.$queryRaw`
      WITH RankedStores AS (
        SELECT
          s.id,
          s.name,
          s.description,
          s.website,
          s.rating,
          s."openingHours",
          s."logoUrl",
          s."addressId",
          s."partnerId",
          CASE
            WHEN sub."planType" = 'PREMIUM' THEN 3
            WHEN sub."planType" = 'GOLD' THEN 2
            WHEN sub."planType" = 'SILVER' THEN 1
            ELSE 0
            END as plan_priority,
          ROW_NUMBER() OVER (
          ORDER BY 
            CASE 
              WHEN sub."planType" = 'PREMIUM' THEN 3
              WHEN sub."planType" = 'GOLD' THEN 2
              WHEN sub."planType" = 'SILVER' THEN 1
              ELSE 0
            END DESC,
            s.name ASC
        ) as row_num
        FROM "Store" s
               INNER JOIN "PartnerSupplier" ps ON s."partnerId" = ps.id
               LEFT JOIN "Subscription" sub ON ps.id = sub."partnerSupplierId"
        WHERE 1=1
        ${
          search
            ? Prisma.sql`AND (
                s.name ILIKE ${`%${search}%`}
                OR s.description ILIKE ${`%${search}%`}
                OR EXISTS (
                  SELECT 1 
                  FROM "Product" p 
                  WHERE p."storeId" = s.id 
                  AND (
                    p.name ILIKE ${`%${search}%`}
                  )
                )
              )`
            : Prisma.empty
        }
        )
      SELECT id FROM RankedStores
      WHERE row_num > ${(page - 1) * limit}
        AND row_num <= ${page * limit}
      ORDER BY row_num;
    `.then(async (storeIds: any[]) => {
      const ids = storeIds.map((s) => s.id);

      if (ids.length === 0) return [];

      const stores = await this.prisma.store.findMany({
        where: { id: { in: ids } },
        include: {
          address: true,
          products: {
            orderBy: [{ featured: 'desc' }, { name: 'asc' }],
          },
          events: {
            where: {
              isActive: true,
              date: { gte: new Date() },
            },
            include: { address: true },
            orderBy: { date: 'asc' },
          },
          partner: {
            include: {
              subscription: true,
            },
          },
        },
      });

      // mantém a ordem correta do ranking
      return ids.map((id) => stores.find((s) => s.id === id)).filter(Boolean);
    });
  }

  async findOne(id: string) {
    return this.prisma.store.findUnique({
      where: { id },
      include: {
        address: true,
        products: {
          orderBy: [{ featured: 'desc' }, { name: 'asc' }],
        },
        events: {
          where: {
            isActive: true,
            date: {
              gte: new Date(Date.now()),
            },
          },
          include: {
            address: true,
          },
          orderBy: {
            date: 'asc', // eventos mais próximos primeiro
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
}
