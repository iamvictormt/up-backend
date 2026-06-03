import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { PointsService } from 'src/points/points.service';
import { NotFoundException } from '@nestjs/common';

jest.mock('@nestjs/jwt', () => ({
  JwtService: class JwtService {},
}));

describe('AdminService', () => {
  let service: AdminService;
  let prismaService: PrismaService;
  let mailService: MailService;

  beforeEach(async () => {
    const prismaMock: any = {
      $transaction: jest.fn((cb) => cb(prismaMock)),
      partnerSupplier: {
        count: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      subscription: {
        upsert: jest.fn(),
      },
      professional: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
      user: {
        count: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      event: {
        count: jest.fn(),
      },
      recommendedProfessional: {
        count: jest.fn(),
      },
      post: {
        count: jest.fn(),
      },
      physicalSale: {
        count: jest.fn(),
        aggregate: jest.fn(),
      },
      profession: {
        count: jest.fn(),
      },
      community: {
        count: jest.fn(),
      },
      report: {
        count: jest.fn(),
      },
      benefitRedemption: {
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: MailService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        { provide: JwtService, useValue: {} },
        { provide: PointsService, useValue: {} },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prismaService = module.get<PrismaService>(PrismaService);
    mailService = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStatistics', () => {
    it('separates supplier and wellness partner totals and pending counts', async () => {
      const prismaMock = prismaService as any;

      prismaMock.user.count.mockResolvedValueOnce(20);
      prismaMock.professional.count.mockResolvedValueOnce(7);
      prismaMock.partnerSupplier.count
        .mockResolvedValueOnce(4)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(1);
      prismaMock.event.count.mockResolvedValueOnce(5);
      prismaMock.recommendedProfessional.count.mockResolvedValueOnce(6);
      prismaMock.post.count.mockResolvedValueOnce(8).mockResolvedValueOnce(2);
      prismaMock.physicalSale.count.mockResolvedValueOnce(9);
      prismaMock.physicalSale.aggregate.mockResolvedValueOnce({ _sum: { points: 120 } });
      prismaMock.profession.count.mockResolvedValueOnce(10);
      prismaMock.community.count.mockResolvedValueOnce(11);
      prismaMock.report.count.mockResolvedValueOnce(12);
      prismaMock.benefitRedemption.count.mockResolvedValueOnce(13);

      const result = await service.getStatistics();

      expect(result.totalPartnerSuppliers).toBe(4);
      expect(result.totalWellnessPartners).toBe(3);
      expect(result.pendingPartnerSuppliers).toBe(2);
      expect(result.pendingWellnessPartners).toBe(1);
      expect(prismaMock.partnerSupplier.count).toHaveBeenCalledWith({
        where: { type: 'SUPPLIER', isDeleted: false },
      });
      expect(prismaMock.partnerSupplier.count).toHaveBeenCalledWith({
        where: { type: 'WELLNESS', isDeleted: false },
      });
      expect(prismaMock.partnerSupplier.count).toHaveBeenCalledWith({
        where: {
          type: 'SUPPLIER',
          status: 'PENDING',
          isDeleted: false,
        },
      });
      expect(prismaMock.partnerSupplier.count).toHaveBeenCalledWith({
        where: {
          type: 'WELLNESS',
          status: 'PENDING',
          isDeleted: false,
        },
      });
    });
  });

  describe('rejectPartnerSupplier', () => {
    it('should throw NotFoundException if user not found', async () => {
      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(null);
      await expect(service.rejectPartnerSupplier('invalid-id', 'reason')).rejects.toThrow(NotFoundException);
    });

    it('should send email and update status', async () => {
      const mockUser = {
        email: 'test@example.com',
        partnerSupplierId: 'partner-id',
        partnerSupplier: { id: 'partner-id' },
      };
      const reason = 'Incorrect CNPJ';

      (prismaService.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (prismaService.partnerSupplier.update as jest.Mock).mockResolvedValue({ id: 'partner-id', status: 'REJECTED' });

      await service.rejectPartnerSupplier('partner-id', reason);

      expect(mailService.sendMail).toHaveBeenCalledWith(
        mockUser.email,
        'Cadastro reprovado',
        'cadastro-reprovado.html',
        expect.objectContaining({
          reason: reason,
        }),
      );

      expect(prismaService.partnerSupplier.update).toHaveBeenCalledWith({
        where: { id: 'partner-id' },
        data: expect.objectContaining({ status: 'REJECTED' }),
      });
    });
  });

  describe('findAllProfessionals', () => {
    it('should return a list of professionals with pagination metadata', async () => {
      const dto = { page: 1, limit: 10 };
      const mockProfessionals = [{ id: '1', name: 'Pro 1' }];
      const mockCount = 1;

      (prismaService.professional.count as jest.Mock).mockResolvedValue(mockCount);
      (prismaService.professional.findMany as jest.Mock).mockResolvedValue(mockProfessionals);

      const result = await service.findAllProfessionals(dto);

      expect(prismaService.professional.count).toHaveBeenCalled();
      expect(prismaService.professional.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
        }),
      );
      expect(result).toEqual({
        data: mockProfessionals,
        meta: {
          total: mockCount,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it('should apply filters correctly', async () => {
      const dto = { search: 'John', level: 'GOLD' as any, verified: true };

      (prismaService.professional.count as jest.Mock).mockResolvedValue(0);
      (prismaService.professional.findMany as jest.Mock).mockResolvedValue([]);

      await service.findAllProfessionals(dto);

      expect(prismaService.professional.count).toHaveBeenCalledWith({
        where: expect.objectContaining({
          level: 'GOLD',
          verified: true,
          OR: expect.arrayContaining([
            { name: { contains: 'John', mode: 'insensitive' } },
          ]),
        }),
      });
    });
  });

  describe('grantTrial', () => {
    it('should grant a trial to a partner supplier', async () => {
      const partnerSupplierId = 'partner-id';
      const dto: any = { duration: 30, unit: 'days', planType: 'PREMIUM' };

      (prismaService.partnerSupplier.findUnique as jest.Mock).mockResolvedValue({
        id: partnerSupplierId,
      });
      (prismaService.subscription.upsert as jest.Mock).mockResolvedValue({
        partnerSupplierId,
        subscriptionStatus: 'TRIALING',
      });

      const result = await service.grantTrial(partnerSupplierId, dto);

      expect(prismaService.subscription.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { partnerSupplierId },
          update: expect.objectContaining({
            subscriptionStatus: 'TRIALING',
            planType: 'PREMIUM',
            isManual: true,
          }),
        }),
      );
      expect(result.subscriptionStatus).toBe('TRIALING');
    });

    it('should throw NotFoundException if partner supplier does not exist', async () => {
      (prismaService.partnerSupplier.findUnique as jest.Mock).mockResolvedValue(
        null,
      );
      await expect(
        service.grantTrial('invalid-id', {
          duration: 30,
          unit: 'days',
          planType: 'PREMIUM',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
