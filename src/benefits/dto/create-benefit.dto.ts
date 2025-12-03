import { IsBoolean, IsDate, IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBenefitDTO {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  pointsCost: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  expiresAt?: Date;
}