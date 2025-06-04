import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { JwtModule } from '@nestjs/jwt';
import { HashtagModule } from '../hashtag/hashtag.module';

@Module({
  imports: [HashtagModule, JwtModule, PrismaModule],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService]
})
export class PostModule {}
