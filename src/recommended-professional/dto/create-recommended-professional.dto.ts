import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEmail,
  IsPhoneNumber,
  IsUrl,
  IsArray,
  IsEnum,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WeekDay } from '@prisma/client';
import { CreateAddressDto } from '../../address/dto/create-address.dto';

export class SocialMediaDto {
  @IsOptional()
  @IsUrl()
  instagram?: string;

  @IsOptional()
  @IsUrl()
  linkedin?: string;

  @IsOptional()
  @IsPhoneNumber('BR')
  whatsapp?: string;
}

export class CreateRecommendedProfessionalDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  profession: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsPhoneNumber('BR')
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @ValidateNested()
  @Type(() => CreateAddressDto)
  address: CreateAddressDto;

  @IsUrl()
  @IsOptional()
  profileImage?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SocialMediaDto)
  socialMedia?: SocialMediaDto;

  @IsOptional()
  @IsArray()
  @IsEnum(WeekDay, { each: true })
  availableDays?: WeekDay[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
