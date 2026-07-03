import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateWellnessDto {
  @IsString() tradeName: string;
  @IsString() companyName: string;
  @IsString() document: string;
  @IsIn(['CPF', 'CNPJ']) documentType: 'CPF' | 'CNPJ';
  @IsOptional() @IsString() stateRegistration?: string;
  @IsOptional() @IsString() contact?: string;
  @IsOptional() @IsString() profileImage?: string;
}
