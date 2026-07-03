import { PartialType } from '@nestjs/mapped-types';
import { CreateWellnessDto } from './create-wellness.dto';

export class UpdateWellnessDto extends PartialType(CreateWellnessDto) {}
