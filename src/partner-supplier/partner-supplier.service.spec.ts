import { Test, TestingModule } from '@nestjs/testing';
import { PartnerSupplierService } from './partner-supplier.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { MailService } from 'src/mail/mail.service';

describe('PartnerSupplierService', () => {
  let service: PartnerSupplierService;
  let prisma: any;

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
        skip: 6,
        take: 6,
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
      }),
    );
  });
});
