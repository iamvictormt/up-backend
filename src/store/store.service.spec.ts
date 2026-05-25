import { Test, TestingModule } from '@nestjs/testing';
import { StoreService } from './store.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('StoreService', () => {
  let service: StoreService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      $queryRaw: jest.fn().mockResolvedValue([]),
      store: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<StoreService>(StoreService);
  });

  it('filters stores by address state and city', async () => {
    await (service.findAll as any)('', 1, 10, 'SUPPLIER', 'SP', 'Santos');

    const rawQueryValues = JSON.stringify(prisma.$queryRaw.mock.calls[0]);

    expect(rawQueryValues).toContain('SP');
    expect(rawQueryValues).toContain('Santos');
  });
});
