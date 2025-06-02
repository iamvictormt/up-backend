import { Module } from '@nestjs/common';
import { RecommendedProfessionalService } from './recommended-professional.service';
import { RecommendedProfessionalController } from './recommended-professional.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  controllers: [RecommendedProfessionalController],
  providers: [RecommendedProfessionalService, PrismaService],
})
export class RecommendedProfessionalModule {}
