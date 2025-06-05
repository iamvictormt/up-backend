import { PartialType } from '@nestjs/mapped-types';
import { IsString } from 'class-validator';
import { CreateNotificationDto } from './create-notification.dto';

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
  @IsString()
  id: string;
}
