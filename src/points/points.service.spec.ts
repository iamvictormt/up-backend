import { Test, TestingModule } from '@nestjs/testing';
import { PointsService } from './points.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PointOperation } from '@prisma/client';

describe('PointsService', () => {
  let service: PointsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    professional: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    pointHistory: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PointsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PointsService>(PointsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHistory', () => {
    it('should return history for a professional', async () => {
      const professionalId = 'prof-1';
      const mockHistory = [
        {
          id: 'h1',
          operation: PointOperation.ADD,
          value: 100,
          source: 'REFERRAL',
          professionalId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.pointHistory.findMany as jest.Mock).mockResolvedValue(mockHistory);

      const result = await service.getHistory(professionalId);

      expect(prisma.pointHistory.findMany).toHaveBeenCalledWith({
        where: { professionalId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      expect(result).toEqual(mockHistory);
    });
  });
});
