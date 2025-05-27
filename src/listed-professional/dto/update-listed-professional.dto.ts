// dto/update-listed-professional.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateListedProfessionalDto } from './create-listed-professional.dto';

export class UpdateListedProfessionalDto extends PartialType(
  CreateListedProfessionalDto,
) {}
