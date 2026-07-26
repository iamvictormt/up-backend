import { Test, TestingModule } from '@nestjs/testing';
import { PartnerSupplierService } from './partner-supplier.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { MailService } from 'src/mail/mail.service';

describe('PartnerSupplierService', () => {
  let service: PartnerSupplierService;
  let prisma: any;

  const supplier = (
    name: string,
    plan?: string,
    status = 'ACTIVE',
  ) => ({
    store: { name },
    subscription: plan ? { planType: plan, subscriptionStatus: status } : null,
  });

  beforeEach(async () => {
    prisma = {
      partnerSupplier: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartnerSupplierService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: UserService,
          useValue: {},
        },
        {
          provide: MailService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<PartnerSupplierService>(PartnerSupplierService);
  });

  it('filters approved partners by search, state and city', async () => {
    await (service.findAll as any)('WELLNESS', 'yoga', 2, 6, 'RJ', 'Niteroi');

    expect(prisma.partnerSupplier.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'APPROVED',
          isDeleted: false,
          type: 'WELLNESS',
          store: expect.objectContaining({
            is: {
              address: {
                state: 'RJ',
                city: 'Niteroi',
              },
            },
          }),
          OR: expect.any(Array),
        }),
        include: expect.objectContaining({
          subscription: {
            select: { planType: true, subscriptionStatus: true },
          },
        }),
      }),
    );
  });

  it('orders by plan tier (PREMIUM>GOLD>SILVER>none) then name, and paginates', async () => {
    prisma.partnerSupplier.findMany.mockResolvedValue([
      supplier('Bravo', 'SILVER'),
      supplier('Zulu'), // sem plano
      supplier('Alfa', 'PREMIUM'),
      supplier('Charlie', 'GOLD'),
      supplier('Delta', 'PREMIUM'),
      supplier('Echo', 'GOLD', 'CANCELED'), // plano cancelado conta como sem plano
    ]);

    const page1 = await (service.findAll as any)(
      undefined,
      undefined,
      1,
      4,
    );

    expect(page1.map((s: any) => s.store.name)).toEqual([
      'Alfa',
      'Delta',
      'Charlie',
      'Bravo',
    ]);

    const page2 = await (service.findAll as any)(
      undefined,
      undefined,
      2,
      4,
    );

    // sem plano ativo ficam por último, em ordem alfabética
    expect(page2.map((s: any) => s.store.name)).toEqual(['Echo', 'Zulu']);
  });
});
