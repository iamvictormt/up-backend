import { IsNotEmpty, IsString, IsPhoneNumber } from 'class-validator';

export class CreateProfessionalDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  officeName: string;

  @IsNotEmpty()
  @IsString()
  profession: string;

  @IsNotEmpty()
  @IsString()
  document: string;

  @IsNotEmpty()
  @IsString()
  generalRegister: string;

  @IsNotEmpty()
  @IsString()
  registrationAgency: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;
}
