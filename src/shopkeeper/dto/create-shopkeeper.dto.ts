import { IsNotEmpty, IsString, IsPhoneNumber } from 'class-validator';

export class CreateShopkeeperDto {
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
  segment: string;
}
