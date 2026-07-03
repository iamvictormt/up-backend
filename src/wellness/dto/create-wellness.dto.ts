import { IsOptional, IsString } from 'class-validator';

export class CreateWellnessDto {
  @IsString()
  name: string;

  @IsString()
  document: string; // CPF

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
  profileImage?: string;
}
