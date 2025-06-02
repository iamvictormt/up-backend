import { PartialType } from '@nestjs/mapped-types';
import { CreatePartnerSupplierDto } from './create-partner-supplier.dto';

export class UpdatePartnerSupplierDto extends PartialType(
  CreatePartnerSupplierDto,
) {}
