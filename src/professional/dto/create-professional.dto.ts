import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProfessionalLevel } from '@prisma/client';
import { CreateAddressDto } from '../../address/dto/create-address.dto'; // Enum no Prisma

export class CreateProfessionalDto {
  @IsString() name: string;
  @IsString() profession: string;

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

  @ValidateNested()
  @Type(() => CreateAddressDto)
  @IsOptional()
  address?: CreateAddressDto;

  @IsOptional()
  @IsUUID()
  userId?: string;
}
