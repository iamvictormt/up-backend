import { IsOptional, IsInt, IsString, IsEnum, IsBoolean, Min, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { ProfessionalLevel } from '@prisma/client';

export class FindAllProfessionalsDto {
  @IsOptional()
  @Transform(({ value }) => value === undefined ? undefined : parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => value === undefined ? undefined : parseInt(value))
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ProfessionalLevel)
  level?: ProfessionalLevel;

  @IsOptional()
  @IsString()
  professionId?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  verified?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['name', 'createdAt', 'points', 'level'])
  orderBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';
}
