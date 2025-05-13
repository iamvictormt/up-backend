import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePartnerSupplierDto {
  @IsNotEmpty()
  @IsString()
  tradeName: string;

  @IsNotEmpty()
  @IsString()
  companyName: string;

  @IsNotEmpty()
  @IsString()
  document: string;

  @IsNotEmpty()
  @IsString()
  stateRegistration: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  contact: string;
}
