import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LikeController } from './like.controller';
import { LikeService } from './like.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule, PrismaModule],
  controllers: [LikeController],
  providers: [LikeService],
})
export class LikeModule {}
