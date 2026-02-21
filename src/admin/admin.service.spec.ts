import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { PointsService } from 'src/points/points.service';
import { NotFoundException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let prismaService: PrismaService;
  let mailService: MailService;

  beforeEach(async () => {
    const prismaMock: any = {
      $transaction: jest.fn((cb) => cb(prismaMock)),
      user: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      partnerSupplier: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      subscription: {
        upsert: jest.fn(),
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
