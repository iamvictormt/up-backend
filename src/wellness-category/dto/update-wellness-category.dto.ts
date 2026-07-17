import { PartialType } from '@nestjs/mapped-types';
import { CreateWellnessCategoryDto } from './create-wellness-category.dto';

export class UpdateWellnessCategoryDto extends PartialType(CreateWellnessCategoryDto) {}
