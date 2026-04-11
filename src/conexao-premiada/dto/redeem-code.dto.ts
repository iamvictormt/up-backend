import { IsNotEmpty, IsString } from 'class-validator';

export class RedeemCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
