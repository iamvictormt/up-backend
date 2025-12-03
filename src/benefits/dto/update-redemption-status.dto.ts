import { IsEnum } from 'class-validator';
import { RedemptionStatus } from '@prisma/client';

export class UpdateRedemptionStatusDto {
  @IsEnum(RedemptionStatus)
  status: RedemptionStatus;
}