import { PartialType } from '@nestjs/mapped-types';
import { CreateRecommendedProfessionalDto } from './create-recommended-professional.dto';

export class UpdateRecommendedProfessionalDto extends PartialType(
  CreateRecommendedProfessionalDto,
) {}
