import { IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  state: string;

  @IsString()
  city: string;

  @IsString()
  district: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  complement?: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;
}
