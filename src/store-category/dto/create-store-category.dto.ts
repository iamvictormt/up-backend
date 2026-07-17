import { IsOptional, IsString } from 'class-validator';

export class CreateStoreCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
