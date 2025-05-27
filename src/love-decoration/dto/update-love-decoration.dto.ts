import { PartialType } from '@nestjs/mapped-types';
import { CreateLoveDecorationDto } from './create-love-decoration.dto';

export class UpdateLoveDecorationDto extends PartialType(
  CreateLoveDecorationDto,
) {}
