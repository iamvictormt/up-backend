import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConexaoPremiadaService, maskDocument, pointsForValue } from './conexao-premiada.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PointsService } from 'src/points/points.service';

describe('ConexaoPremiadaService', () => {
  let service: ConexaoPremiadaService;
  let prisma: any;
  let points: { addPoints: jest.Mock; removePoints: jest.Mock };

  const partner = { id: 'partner-1', pointsLimit: 0, currentPointsAwarded: 0 };

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn((cb) => cb(prisma)),
      user: { findUnique: jest.fn().mockResolvedValue({ id: 'u1', partnerSupplier: partner, professional: { id: 'prof-1' } }) },
      partnerSupplier: { update: jest.fn() },
      professional: { findFirst: jest.fn(), findMany: jest.fn().mockResolvedValue([]) },
      physicalSale: {
        create: jest.fn(({ data }) => Promise.resolve({ id: 'sale-1', ...data })),
        findUnique: jest.fn(),
        findFirst: jest.fn().mockResolvedValue(null),
        updateMany: jest.fn(),
        update: jest.fn(({ data }) => Promise.resolve({ points: 0, ...data })),
      },
    };
    points = { addPoints: jest.fn(), removePoints: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        ConexaoPremiadaService,
        { provide: PrismaService, useValue: prisma },
        { provide: PointsService, useValue: points },
      ],
    }).compile();
    service = module.get(ConexaoPremiadaService);
  });

  it('1 real = 1 ponto, arredondando qualquer centavo para cima', () => {
    expect(pointsForValue(1000)).toBe(1000);
    expect(pointsForValue(1000.1)).toBe(1001);
    expect(pointsForValue(1000.9)).toBe(1001);
  });

  it('mascara CPF e CNPJ, com ou sem pontuação', () => {
    expect(maskDocument('123.456.789-01')).toBe('***.456.789-**');
    expect(maskDocument('12345678901')).toBe('***.456.789-**');
    expect(maskDocument('12.345.678/0001-90')).toBe('**.345.678/****-**');
    expect(maskDocument(null)).toBeNull();
  });

  it('busca por CPF procura com e sem máscara e não devolve o CPF inteiro', async () => {
    prisma.professional.findMany.mockResolvedValue([
      { id: 'prof-1', name: 'Ana', officeName: null, document: '123.456.789-01', profession: { name: 'Arquiteta' } },
    ]);

    const result = await service.searchProfessionals('u1', '123.456.789-01');

    expect(prisma.professional.findMany.mock.calls[0][0].where.document).toEqual({ in: ['12345678901', '123.456.789-01'] });
    expect(result).toEqual({
      items: [{ id: 'prof-1', name: 'Ana', officeName: null, profession: 'Arquiteta', document: '***.456.789-**' }],
      hasMore: false,
    });
  });

  it('busca curta demais não consulta o banco', async () => {
    expect(await service.searchProfessionals('u1', 'an')).toEqual({ items: [], hasMore: false });
    expect(prisma.professional.findMany).not.toHaveBeenCalled();
  });

  it('venda com profissional credita os pontos na hora', async () => {
    prisma.professional.findFirst.mockResolvedValue({ id: 'prof-1', name: 'Ana' });
    prisma.partnerSupplier.update.mockResolvedValue({ pointsLimit: 0, currentPointsAwarded: 1501 });

    const result = await service.registerSale('u1', { customerName: 'Outro nome', value: 1500.75, invoice: 'NF-1', professionalId: 'prof-1' });

    expect(result).toMatchObject({ credited: true, points: 1501, professionalName: 'Ana' });
    expect(prisma.physicalSale.create.mock.calls[0][0].data).toMatchObject({
      professionalId: 'prof-1',
      points: 1501,
      customerName: 'Ana', // nome digitado é ignorado: vale o do profissional
    });
    expect(points.addPoints).toHaveBeenCalledWith('prof-1', 1501, expect.stringMatching(/^CONEXAO_PREMIADA_/), prisma);
  });

  it('venda que estoura o limite da loja não credita', async () => {
    prisma.professional.findFirst.mockResolvedValue({ id: 'prof-1', name: 'Ana' });
    prisma.partnerSupplier.update.mockResolvedValue({ pointsLimit: 1000, currentPointsAwarded: 1500 });

    await expect(
      service.registerSale('u1', { customerName: 'Cliente', value: 1500, invoice: 'NF-2', professionalId: 'prof-1' }),
    ).rejects.toThrow(BadRequestException);
    expect(points.addPoints).not.toHaveBeenCalled();
  });

  it('venda sem profissional gera código e não credita', async () => {
    const result = await service.registerSale('u1', { customerName: 'Cliente', value: 300, invoice: 'NF-3' });

    expect(result).toMatchObject({ credited: false, points: 300 });
    expect(result.code).toMatch(/^[0-9A-F]{16}$/);
    expect(points.addPoints).not.toHaveBeenCalled();
  });

  it('código resgatado em paralelo só credita uma vez', async () => {
    prisma.physicalSale.findUnique.mockResolvedValue({ id: 'sale-1', code: 'ABC', points: 300, partnerId: 'partner-1', redeemedAt: null });
    prisma.physicalSale.updateMany.mockResolvedValue({ count: 0 });

    await expect(service.redeemCode('u1', { code: 'ABC' })).rejects.toThrow('já foi resgatado');
    expect(points.addPoints).not.toHaveBeenCalled();
  });

  describe('correção de venda', () => {
    const now = Date.now();
    const creditedSale = (daysAgo: number) => ({
      id: 'sale-1', code: 'ABC', partnerId: 'partner-1', professionalId: 'prof-1',
      value: 1000, points: 1000, redeemedAt: new Date(), cancelledAt: null,
      customerName: 'Cliente', sellerName: null, invoice: null,
      createdAt: new Date(now - daysAgo * 24 * 60 * 60 * 1000),
    });

    it('paginação: pede um a mais para saber se tem próxima página', async () => {
      prisma.professional.findMany.mockResolvedValue(Array.from({ length: 11 }, (_, i) => ({ id: `p${i}`, name: `Ana ${i}`, document: null })));

      const result = await service.searchProfessionals('u1', 'Ana', 2);

      expect(prisma.professional.findMany.mock.calls[0][0]).toMatchObject({ skip: 10, take: 11 });
      expect(result.items).toHaveLength(10);
      expect(result.hasMore).toBe(true);
    });

    it('lojista diminui o valor: tira a diferença do profissional e devolve ao limite da loja', async () => {
      prisma.physicalSale.findUnique.mockResolvedValue(creditedSale(1));

      const result = await service.updateSaleAsPartner('u1', 'sale-1', { value: 600 });

      expect(points.removePoints).toHaveBeenCalledWith('prof-1', 400, 'CONEXAO_PREMIADA_AJUSTE_ABC', prisma);
      expect(prisma.partnerSupplier.update).toHaveBeenCalledWith({ where: { id: 'partner-1' }, data: { currentPointsAwarded: { decrement: 400 } } });
      expect(result.pointsDiff).toBe(-400);
    });

    it('lojista aumenta o valor: credita a diferença', async () => {
      prisma.physicalSale.findUnique.mockResolvedValue(creditedSale(1));
      prisma.partnerSupplier.update.mockResolvedValue({ pointsLimit: 0, currentPointsAwarded: 1200 });

      await service.updateSaleAsPartner('u1', 'sale-1', { value: 1200 });

      expect(points.addPoints).toHaveBeenCalledWith('prof-1', 200, 'CONEXAO_PREMIADA_AJUSTE_ABC', prisma);
    });

    it('lojista não corrige depois de 3 dias, admin sim', async () => {
      prisma.physicalSale.findUnique.mockResolvedValue(creditedSale(4));

      await expect(service.cancelSaleAsPartner('u1', 'sale-1')).rejects.toThrow('prazo de 3 dias');

      await service.cancelSaleAsAdmin('sale-1');
      expect(points.removePoints).toHaveBeenCalledWith('prof-1', 1000, 'CONEXAO_PREMIADA_ESTORNO_ABC', prisma);
      expect(prisma.physicalSale.update.mock.calls[0][0].data.cancelledAt).toBeInstanceOf(Date);
    });

    it('cancelar código ainda não resgatado não mexe em saldo', async () => {
      prisma.physicalSale.findUnique.mockResolvedValue({ ...creditedSale(0), redeemedAt: null, professionalId: null });

      await service.cancelSaleAsPartner('u1', 'sale-1');

      expect(points.removePoints).not.toHaveBeenCalled();
      expect(prisma.partnerSupplier.update).not.toHaveBeenCalled();
    });

    it('lojista não mexe em venda de outra loja', async () => {
      prisma.physicalSale.findUnique.mockResolvedValue({ ...creditedSale(0), partnerId: 'outra-loja' });

      await expect(service.cancelSaleAsPartner('u1', 'sale-1')).rejects.toThrow('Venda não encontrada');
    });

    it('código cancelado não pode ser resgatado', async () => {
      prisma.physicalSale.findUnique.mockResolvedValue({ ...creditedSale(0), redeemedAt: null, cancelledAt: new Date() });

      await expect(service.redeemCode('u1', { code: 'ABC' })).rejects.toThrow('cancelado');
    });
  });

  it('minhas compras: só vendas creditadas do profissional, sem dados do cliente', async () => {
    prisma.user.findUnique.mockResolvedValue({ professional: { id: 'prof-1' } });
    prisma.physicalSale.findMany = jest.fn().mockResolvedValue([]);

    await service.findMyPurchases('u1');

    const args = prisma.physicalSale.findMany.mock.calls[0][0];
    expect(args.where).toEqual({ professionalId: 'prof-1', redeemedAt: { not: null } });
    expect(args.select.customerName).toBeUndefined();
    expect(args.select.partner).toEqual({ select: { tradeName: true } });
  });

  describe('nota fiscal', () => {
    it('bloqueia a mesma NF duas vezes na mesma loja, sem diferenciar maiúsculas', async () => {
      prisma.physicalSale.findFirst.mockResolvedValue({ id: 'outra-venda' });

      await expect(service.registerSale('u1', { customerName: 'Cliente', value: 300, invoice: ' nf-3 ' })).rejects.toThrow(
        'Já existe uma venda com esta nota fiscal',
      );

      const where = prisma.physicalSale.findFirst.mock.calls[0][0].where;
      expect(where).toMatchObject({ partnerId: 'partner-1', cancelledAt: null, invoice: { equals: 'nf-3', mode: 'insensitive' } });
      expect(prisma.physicalSale.create).not.toHaveBeenCalled();
    });

    it('na correção, a própria venda não conta como duplicada', async () => {
      prisma.physicalSale.findUnique.mockResolvedValue({
        id: 'sale-1', code: 'ABC', partnerId: 'partner-1', professionalId: 'prof-1', value: 1000, points: 1000,
        redeemedAt: new Date(), cancelledAt: null, customerName: 'Ana', sellerName: null, invoice: 'NF-1', createdAt: new Date(),
      });

      await service.updateSaleAsPartner('u1', 'sale-1', { invoice: 'NF-9', customerName: 'Outro nome' });

      expect(prisma.physicalSale.findFirst.mock.calls[0][0].where.id).toEqual({ not: 'sale-1' });
      // venda com profissional: o nome do cliente não muda
      expect(prisma.physicalSale.update.mock.calls[0][0].data).toMatchObject({ customerName: 'Ana', invoice: 'NF-9' });
    });
  });

  it('recusa venda sem nota fiscal mesmo sem validação de DTO', async () => {
    await expect(service.registerSale('u1', { customerName: 'Cliente', value: 300 } as any)).rejects.toThrow(
      'Informe a nota fiscal',
    );
    expect(prisma.physicalSale.create).not.toHaveBeenCalled();
  });
});
