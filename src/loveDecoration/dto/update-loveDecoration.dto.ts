import { PartialType } from '@nestjs/mapped-types';
import { CreateLoveDecorationDto } from './create-loveDecoration.dto';

export class UpdateLoveDecorationDto extends PartialType(
  CreateLoveDecorationDto,
) {}
