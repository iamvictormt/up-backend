import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LikeController } from './like.controller';
import { LikeService } from './like.service';

@Module({
  imports: [PrismaModule],
  controllers: [LikeController],
  providers: [LikeService],
})
export class LikeModule {}
