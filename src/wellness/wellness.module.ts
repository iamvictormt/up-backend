import { Module } from '@nestjs/common';
import { WellnessController } from './wellness.controller';
import { WellnessService } from './wellness.service';
import { UserModule } from '../user/user.module';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [UserModule, PrismaModule, JwtModule],
  controllers: [WellnessController],
  providers: [WellnessService],
  exports: [WellnessService],
})
export class WellnessModule {}
