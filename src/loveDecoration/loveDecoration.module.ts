import { Module } from '@nestjs/common';
import { LoveDecorationService } from './loveDecoration.service';
import { LoveDecorationController } from './loveDecoration.controller';
import { UserModule } from '../user/user.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [UserModule, PrismaModule],
  controllers: [LoveDecorationController],
  providers: [LoveDecorationService],
})
export class LoveDecorationModule {}
