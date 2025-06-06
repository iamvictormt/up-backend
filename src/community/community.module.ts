import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { JwtModule } from '@nestjs/jwt';
import { PostModule } from '../post/post.module';

@Module({
  imports: [JwtModule, PostModule, PrismaModule],
  controllers: [CommunityController],
  providers: [CommunityService],
})
export class CommunityModule {}
