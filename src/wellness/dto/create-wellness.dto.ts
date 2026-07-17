import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateWellnessDto {
  @IsString()
  name: string;

  @IsString()
  document: string; // CPF ou CNPJ, conforme documentType

  @IsOptional()
  @IsIn(['CPF', 'CNPJ'])
  documentType?: 'CPF' | 'CNPJ';

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsString()
  description?: string;

  // texto pré-populado do link de WhatsApp
  @IsOptional()
  @IsString()
  whatsappMessage?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  openingHours?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;
}
