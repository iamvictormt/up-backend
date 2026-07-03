import { BadRequestException } from '@nestjs/common';
import { WellnessService } from './wellness.service';

describe('WellnessService', () => {
  const base = { create: jest.fn() } as any;
  const service = new WellnessService(base);

  beforeEach(() => jest.clearAllMocks());

  it('creates WELLNESS with valid CPF', async () => {
    base.create.mockResolvedValue({ ok: true });
    await service.create(
      {
        tradeName: 'Yoga',
        companyName: 'Maria Silva',
        document: '123.456.789-09',
        documentType: 'CPF',
      } as any,
      { email: 'a@a.com', password: 'x' } as any,
    );
    expect(base.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'WELLNESS', documentType: 'CPF' }),
      expect.anything(),
    );
  });

  it('creates WELLNESS with valid CNPJ', async () => {
    base.create.mockResolvedValue({ ok: true });
    await service.create(
      {
        tradeName: 'Studio',
        companyName: 'Studio LTDA',
        document: '11.222.333/0001-81',
        documentType: 'CNPJ',
      } as any,
      { email: 'b@b.com', password: 'x' } as any,
    );
    expect(base.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'WELLNESS', documentType: 'CNPJ' }),
      expect.anything(),
    );
  });

  it('rejects invalid CPF length', async () => {
    await expect(
      service.create(
        {
          tradeName: 'Yoga',
          companyName: 'Maria',
          document: '123',
          documentType: 'CPF',
        } as any,
        { email: 'a@a.com', password: 'x' } as any,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('drops stateRegistration when CPF', async () => {
    base.create.mockResolvedValue({ ok: true });
    await service.create(
      {
        tradeName: 'Yoga',
        companyName: 'Maria',
        document: '123.456.789-09',
        documentType: 'CPF',
        stateRegistration: '123',
      } as any,
      { email: 'a@a.com', password: 'x' } as any,
    );
    expect(base.create).toHaveBeenCalledWith(
      expect.objectContaining({ stateRegistration: undefined }),
      expect.anything(),
    );
  });
});
