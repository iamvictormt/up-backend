import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAddressDto } from '../../address/dto/create-address.dto';

export class CreateLoveDecorationDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  contact: string;

  @IsString()
  instagram: string;

  @IsString()
  tiktok?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address?: CreateAddressDto;
}
