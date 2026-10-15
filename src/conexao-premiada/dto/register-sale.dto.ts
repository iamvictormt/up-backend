import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class RegisterSaleDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsNumber()
  @Min(1)
  value: number;

  @IsString()
  @IsOptional()
  sellerName?: string;

  // Nota fiscal obrigatória: comprovante da venda e trava contra lançamento em dobro
  @IsString()
  @IsNotEmpty({ message: 'Informe a nota fiscal.' })
  invoice: string;

  // Profissional identificado na busca: pontos creditados na hora, sem código
  @IsUUID()
  @IsOptional()
  professionalId?: string;
}
