import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { PointsService } from 'src/points/points.service';
import { NotFoundException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: PrismaService;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findFirst: jest.fn(),
              findMany: jest.fn(),
              deleteMany: jest.fn(),
            },
            partnerSupplier: {
              delete: jest.fn(),
            },
            subscription: {
              deleteMany: jest.fn(),
            },
            store: {
              findMany: jest.fn(),
              deleteMany: jest.fn(),
            },
            product: {
              deleteMany: jest.fn(),
            },
            event: {
              findMany: jest.fn(),
              deleteMany: jest.fn(),
            },
            eventRegistration: {
              deleteMany: jest.fn(),
            },
            address: {
              deleteMany: jest.fn(),
            },
            passwordResetCode: {
              deleteMany: jest.fn(),
            },
            notification: {
              deleteMany: jest.fn(),
            },
            comment: {
              deleteMany: jest.fn(),
            },
            like: {
              deleteMany: jest.fn(),
            },
            post: {
              deleteMany: jest.fn(),
            },
            $transaction: jest.fn((cb) => cb({
              user: {
                findMany: jest.fn(),
                deleteMany: jest.fn(),
              },
              partnerSupplier: {
                delete: jest.fn(),
              },
              subscription: {
                deleteMany: jest.fn(),
              },
              store: {
                findMany: jest.fn(),
                deleteMany: jest.fn(),
              },
              product: {
                deleteMany: jest.fn(),
              },
              event: {
                findMany: jest.fn(),
                deleteMany: jest.fn(),
              },
              eventRegistration: {
                deleteMany: jest.fn(),
              },
              address: {
                deleteMany: jest.fn(),
              },
              passwordResetCode: {
                deleteMany: jest.fn(),
              },
              notification: {
                deleteMany: jest.fn(),
              },
              comment: {
                deleteMany: jest.fn(),
              },
              like: {
                deleteMany: jest.fn(),
              },
              post: {
                deleteMany: jest.fn(),
              },
            })),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: PointsService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prisma = module.get<PrismaService>(PrismaService);
    mailService = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('rejectPartnerSupplier', () => {
    it('should throw NotFoundException if user not found', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(service.rejectPartnerSupplier('1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should send email and delete partner supplier', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        partnerSupplier: { id: 'partner-id' },
      };
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);

      const deleteSpy = jest.spyOn(service, 'deletePartnerSupplier').mockResolvedValue({} as any);

      await service.rejectPartnerSupplier('partner-id');

      expect(mailService.sendMail).toHaveBeenCalledWith(
        'test@example.com',
        'Cadastro reprovado',
        'cadastro-reprovado.html',
        expect.anything(),
      );
      expect(deleteSpy).toHaveBeenCalledWith('partner-id');
    });
  });

  describe('deletePartnerSupplier', () => {
    it('should call delete on all related models in transaction', async () => {
      const mockTx = {
        user: {
          findMany: jest.fn().mockResolvedValue([{ id: 'u1', addressId: 'a1' }]),
          deleteMany: jest.fn()
        },
        store: {
          findMany: jest.fn().mockResolvedValue([{ id: 's1', addressId: 'a2' }]),
          deleteMany: jest.fn()
        },
        subscription: { deleteMany: jest.fn() },
        product: { deleteMany: jest.fn() },
        event: {
          findMany: jest.fn().mockResolvedValue([{ id: 'e1' }]),
          deleteMany: jest.fn()
        },
        eventRegistration: { deleteMany: jest.fn() },
        passwordResetCode: { deleteMany: jest.fn() },
        notification: { deleteMany: jest.fn() },
        comment: { deleteMany: jest.fn() },
        like: { deleteMany: jest.fn() },
        post: { deleteMany: jest.fn() },
        address: { deleteMany: jest.fn() },
        partnerSupplier: { delete: jest.fn() },
      };
      (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => cb(mockTx));

      await service.deletePartnerSupplier('p1');

      expect(mockTx.subscription.deleteMany).toHaveBeenCalledWith({ where: { partnerSupplierId: 'p1' } });
      expect(mockTx.product.deleteMany).toHaveBeenCalledWith({ where: { storeId: { in: ['s1'] } } });
      expect(mockTx.eventRegistration.deleteMany).toHaveBeenCalledWith({ where: { eventId: { in: ['e1'] } } });
      expect(mockTx.event.deleteMany).toHaveBeenCalledWith({ where: { id: { in: ['e1'] } } });
      expect(mockTx.store.deleteMany).toHaveBeenCalledWith({ where: { partnerId: 'p1' } });
      expect(mockTx.user.deleteMany).toHaveBeenCalledWith({ where: { partnerSupplierId: 'p1' } });
      expect(mockTx.address.deleteMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          id: { in: expect.arrayContaining(['a1', 'a2']) }
        })
      }));
      expect(mockTx.partnerSupplier.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
    });
  });
});
