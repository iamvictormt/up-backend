import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WellnessCategoryController } from './wellness-category.controller';
import { WellnessCategoryService } from './wellness-category.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule, PrismaModule],
  controllers: [WellnessCategoryController],
  providers: [WellnessCategoryService],
})
export class WellnessCategoryModule {}
