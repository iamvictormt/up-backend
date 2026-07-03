import { IsString, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAddressDto } from '../../address/dto/create-address.dto';

export class CreateStoreDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  openingHours?: string;

  @IsString()
  partnerId: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  // texto pré-populado do link de WhatsApp (wa.me/<contato>?text=...)
  @IsOptional()
  @IsString()
  whatsappMessage?: string;

  @ValidateNested()
  @Type(() => CreateStoreDto)
  address: CreateAddressDto;
}
