import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  findAll(@CurrentUser() user) {
    return this.notificationService.findAll(user.sub);
  }

  @Patch('read/:id')
  updateRead(@Param('id') id: string) {
    return this.notificationService.updateRead(id);
  }

  @Patch('all-read')
  updateAllRead(@CurrentUser() user) {
    return this.notificationService.updateAllRead(user.sub);
  }
}
