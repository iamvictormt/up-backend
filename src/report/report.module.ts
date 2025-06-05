import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule, PrismaModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
