import { NotificationModule } from '../notification/notification.module';
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LikeController } from './like.controller';
import { LikeService } from './like.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [NotificationModule, JwtModule, PrismaModule],
  controllers: [LikeController],
  providers: [LikeService],
})
export class LikeModule {}
