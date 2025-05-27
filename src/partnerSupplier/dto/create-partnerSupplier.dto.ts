import { IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAddressDto } from '../../address/dto/create-address.dto';

export class CreatePartnerSupplierDto {
  @IsString()
  tradeName: string;

  @IsString()
  companyName: string;

  @IsString()
  document: string;

  @IsOptional()
  @IsString()
  stateRegistration?: string;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsBoolean()
  accessPending?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address?: CreateAddressDto;
}
