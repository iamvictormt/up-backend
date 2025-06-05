import { IsString, IsUUID } from 'class-validator';

export class CreateReportDto {
  @IsString()
  reason: string;

  @IsString()
  description?: string;

  @IsUUID()
  targetId: string;

  @IsString()
  targetType: string;
}
