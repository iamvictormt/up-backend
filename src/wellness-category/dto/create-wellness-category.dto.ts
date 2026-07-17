import { IsOptional, IsString } from 'class-validator';

export class CreateWellnessCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
