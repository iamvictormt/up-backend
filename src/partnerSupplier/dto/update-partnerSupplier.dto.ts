import { PartialType } from '@nestjs/mapped-types';
import { CreatePartnerSupplierDto } from './create-partnerSupplier.dto';

export class UpdatePartnerSupplierDto extends PartialType(CreatePartnerSupplierDto) {}