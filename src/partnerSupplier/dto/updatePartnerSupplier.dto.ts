import { IsBoolean } from 'class-validator';

export class UpdatePartnerSupplierDto {
  @IsBoolean()
  accessPending: boolean;
}
