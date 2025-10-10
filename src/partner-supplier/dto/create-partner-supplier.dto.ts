import { IsBoolean, IsOptional, IsString } from 'class-validator';

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
}
