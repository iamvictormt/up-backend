import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateOfferingDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  // opcional: sem preço = "sob consulta"
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}

export class UpdateOfferingDto extends PartialType(CreateOfferingDto) {}
