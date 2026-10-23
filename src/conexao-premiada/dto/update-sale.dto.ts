import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

// Profissional não muda na correção: se foi a pessoa errada, cancela e lança de novo
export class UpdateSaleDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  customerName?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  value?: number;

  @IsString()
  @IsOptional()
  sellerName?: string;

  @IsString()
  @IsNotEmpty({ message: 'Informe a nota fiscal.' })
  @IsOptional()
  invoice?: string;
}
