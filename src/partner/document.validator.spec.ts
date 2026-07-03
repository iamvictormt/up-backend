import { isValidDocument, normalizeDocument } from './document.validator';

describe('document.validator', () => {
  it('normalizeDocument strips non-digits', () => {
    expect(normalizeDocument('123.456.789-09')).toBe('12345678909');
    expect(normalizeDocument('11.222.333/0001-81')).toBe('11222333000181');
  });

  it('accepts CPF with 11 digits', () => {
    expect(isValidDocument('CPF', '123.456.789-09')).toBe(true);
  });

  it('rejects CPF with wrong length', () => {
    expect(isValidDocument('CPF', '1234567890')).toBe(false);
  });

  it('accepts CNPJ with 14 digits', () => {
    expect(isValidDocument('CNPJ', '11.222.333/0001-81')).toBe(true);
  });

  it('rejects CNPJ with wrong length', () => {
    expect(isValidDocument('CNPJ', '112223330001')).toBe(false);
  });
});
