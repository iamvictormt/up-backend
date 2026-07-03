import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { WellnessService } from './wellness.service';

describe('WellnessService', () => {
  let prisma: any;
  let userService: any;
  let service: WellnessService;

  beforeEach(() => {
    prisma = {
      $transaction: jest.fn((cb) => cb(prisma)),
      wellness: {
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      wellnessOffering: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findUnique: jest.fn(),
      },
      user: { findUnique: jest.fn() },
      professional: { update: jest.fn() },
    };
    userService = {
      checkIfEmailExists: jest.fn().mockResolvedValue(false),
      hashPassword: jest.fn().mockResolvedValue('hashed'),
      createUserWithRelation: jest.fn().mockResolvedValue({ id: 'u1' }),
    };
    service = new WellnessService(prisma, userService);
  });

  it('creates wellness with valid CPF', async () => {
    prisma.wellness.create.mockResolvedValue({ id: 'w1' });
    await service.create(
      { name: 'Maria Silva', document: '123.456.789-09' } as any,
      { email: 'a@a.com', password: 'x' } as any,
    );
    expect(prisma.wellness.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ name: 'Maria Silva', document: '123.456.789-09' }),
    });
    expect(userService.createUserWithRelation).toHaveBeenCalledWith(
      expect.anything(),
      undefined,
      undefined,
      undefined,
      prisma,
      'hashed',
      'w1',
    );
  });

  it('rejects invalid CPF on create', async () => {
    await expect(
      service.create(
        { name: 'Maria', document: '123' } as any,
        { email: 'a@a.com', password: 'x' } as any,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('blocks updating an offering owned by another wellness', async () => {
    prisma.user.findUnique.mockResolvedValue({ wellnessId: 'w1' });
    prisma.wellnessOffering.findUnique.mockResolvedValue({ wellnessId: 'w2' });
    await expect(
      service.updateOffering('user-1', 'off-1', { name: 'X' } as any),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('creates offering without price (sob consulta)', async () => {
    prisma.user.findUnique.mockResolvedValue({ wellnessId: 'w1' });
    prisma.wellnessOffering.create.mockResolvedValue({ id: 'off-1' });
    await service.createOffering('user-1', { name: 'Massagem' } as any);
    expect(prisma.wellnessOffering.create).toHaveBeenCalledWith({
      data: { name: 'Massagem', wellnessId: 'w1' },
    });
  });
});
