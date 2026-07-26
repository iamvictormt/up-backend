import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { EventService } from './event.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('EventService.create', () => {
  let service: EventService;
  let prisma: any;

  const baseDto = {
    name: 'Evento',
    description: 'desc',
    date: '2026-08-01T12:00:00.000Z',
    type: 'Workshop',
    points: 10,
    totalSpots: 5,
  } as any;

  beforeEach(async () => {
    prisma = {
      store: { findUnique: jest.fn() },
      event: { create: jest.fn().mockResolvedValue({ id: 'ev' }) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
  });

  it('cria evento sem loja quando há endereço, sem conectar store', async () => {
    await service.create({
      ...baseDto,
      address: { state: 'SP', city: 'SP' },
    });

    const arg = prisma.event.create.mock.calls[0][0];
    expect(arg.data.store).toBeUndefined();
    expect(arg.data.address).toEqual({ create: { state: 'SP', city: 'SP' } });
    expect(prisma.store.findUnique).not.toHaveBeenCalled();
  });

  it('rejeita evento sem loja e sem endereço', async () => {
    await expect(service.create({ ...baseDto })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.event.create).not.toHaveBeenCalled();
  });

  it('conecta a loja e herda o endereço dela quando só storeId é informado', async () => {
    prisma.store.findUnique.mockResolvedValue({ addressId: 'addr-1' });

    await service.create({ ...baseDto, storeId: 'store-1' });

    const arg = prisma.event.create.mock.calls[0][0];
    expect(arg.data.store).toEqual({ connect: { id: 'store-1' } });
    expect(arg.data.address).toEqual({ connect: { id: 'addr-1' } });
  });
});
