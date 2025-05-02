import { IsNotEmpty, IsString, IsPhoneNumber } from 'class-validator';

export class CreateProfessionalDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  document: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @IsNotEmpty()
  @IsString()
  profession: string;
}
