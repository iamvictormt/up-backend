import { BadRequestException } from '@nestjs/common';
import { SupplierService } from './supplier.service';

describe('SupplierService', () => {
  const base = { create: jest.fn() } as any;
  const service = new SupplierService(base);

  beforeEach(() => jest.clearAllMocks());

  it('rejects CPF documentType', async () => {
    await expect(
      service.create(
        {
          tradeName: 'Loja',
          companyName: 'Razão LTDA',
          document: '123.456.789-09',
          documentType: 'CPF',
        } as any,
        { email: 'a@a.com', password: 'x' } as any,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects invalid CNPJ length', async () => {
    await expect(
      service.create(
        {
          tradeName: 'Loja',
          companyName: 'Razão LTDA',
          document: '123',
          documentType: 'CNPJ',
        } as any,
        { email: 'a@a.com', password: 'x' } as any,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates SUPPLIER with valid CNPJ', async () => {
    base.create.mockResolvedValue({ ok: true });
    await service.create(
      {
        tradeName: 'Loja',
        companyName: 'Razão LTDA',
        document: '11.222.333/0001-81',
        documentType: 'CNPJ',
      } as any,
      { email: 'a@a.com', password: 'x' } as any,
    );
    expect(base.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SUPPLIER', documentType: 'CNPJ' }),
      expect.anything(),
    );
  });
});
