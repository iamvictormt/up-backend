import { IsEmail, IsString, IsArray, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(5, 5)
  code: string;

  @IsString()
  @Length(6, 100)
  newPassword: string;
}
