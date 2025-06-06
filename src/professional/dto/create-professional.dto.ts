import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { ProfessionalLevel } from '@prisma/client';

export class CreateProfessionalDto {
  @IsString()
  name: string;

  @IsString()
  professionId: string;

  @IsOptional()
  @IsString()
  document?: string;

  @IsOptional()
  @IsString()
  generalRegister?: string;

  @IsOptional()
  @IsString()
  registrationAgency?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsString()
  officeName?: string;

  @IsOptional()
  @IsBoolean()
  verified?: boolean;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsEnum(ProfessionalLevel)
  level?: ProfessionalLevel;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  socialMediaId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}
