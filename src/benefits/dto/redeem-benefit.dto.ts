import { IsUUID } from 'class-validator';

export class RedeemBenefitDto {
  @IsUUID()
  benefitId: string;
}
