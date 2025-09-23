import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterProfessionalDto {
  @IsNotEmpty()
  @IsString()
  professionalId: string;
}
