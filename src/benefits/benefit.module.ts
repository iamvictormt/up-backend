import { Module } from '@nestjs/common';
import { BenefitController } from './benefit.controller';
import { BenefitService } from './benefit.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { ProfessionalModule } from '../professional/professional.module';

@Module({
  imports: [JwtModule, PrismaModule, ProfessionalModule],
  controllers: [BenefitController],
  providers: [BenefitService]
})
export class BenefitModule {}
