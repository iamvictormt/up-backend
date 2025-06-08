import { Module } from '@nestjs/common';
import { LoveDecorationService } from './love-decoration.service';
import { LoveDecorationController } from './love-decoration.controller';
import { UserModule } from '../user/user.module';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule, UserModule, PrismaModule],
  controllers: [LoveDecorationController],
  providers: [LoveDecorationService],
})
export class LoveDecorationModule {}
