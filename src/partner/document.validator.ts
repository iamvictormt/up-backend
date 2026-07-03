export type DocumentType = 'CPF' | 'CNPJ';

export function normalizeDocument(value: string): string {
  return (value ?? '').replace(/\D/g, '');
}

// ponytail: só valida comprimento; dígito verificador de CPF/CNPJ se o negócio pedir
export function isValidDocument(type: DocumentType, value: string): boolean {
  const digits = normalizeDocument(value);
  if (type === 'CPF') return digits.length === 11;
  if (type === 'CNPJ') return digits.length === 14;
  return false;
}
