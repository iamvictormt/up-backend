import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateSupplierDto {
  @IsString() tradeName: string;
  @IsString() companyName: string;
  @IsString() document: string;
  @IsIn(['CNPJ']) documentType: 'CNPJ';
  @IsOptional() @IsString() stateRegistration?: string;
  @IsOptional() @IsString() contact?: string;
  @IsOptional() @IsString() profileImage?: string;
}
