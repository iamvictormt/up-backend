import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class RegisterSaleDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsNumber()
  @Min(0.01)
  value: number;

  @IsString()
  @IsOptional()
  sellerName?: string;

  @IsString()
  @IsOptional()
  invoice?: string;
}
