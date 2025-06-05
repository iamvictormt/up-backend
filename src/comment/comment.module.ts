import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { JwtModule } from '@nestjs/jwt';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule, JwtModule, PrismaModule],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
