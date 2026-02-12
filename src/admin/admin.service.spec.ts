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
    const mockPrisma = {
      user: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      partnerSupplier: {
        update: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(mockPrisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
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
        data: {
          status: 'REJECTED',
          isDeleted: true,
          deletedAt: expect.any(Date),
        },
      });
    });
  });
});
