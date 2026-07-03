import { Module } from '@nestjs/common';
import { WellnessController } from './wellness.controller';
import { WellnessService } from './wellness.service';
import { PartnerModule } from '../partner/partner.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PartnerModule, JwtModule],
  controllers: [WellnessController],
  providers: [WellnessService],
})
export class WellnessModule {}
