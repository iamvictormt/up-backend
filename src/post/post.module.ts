import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule, PrismaModule],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
