import { IsString, IsOptional, IsArray, ArrayNotEmpty } from 'class-validator';

export class CreateCommunityDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  color: string;

  @IsString()
  icon: string;
}
