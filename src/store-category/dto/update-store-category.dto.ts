import { PartialType } from '@nestjs/mapped-types';
import { CreateStoreCategoryDto } from './create-store-category.dto';

export class UpdateStoreCategoryDto extends PartialType(CreateStoreCategoryDto) {}
