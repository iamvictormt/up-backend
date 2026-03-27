import { Module } from '@nestjs/common';
import { PointsController } from './points.controller';
import { PointsService } from './points.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [PointsController],
  providers: [PointsService],
  imports: [PrismaModule, AuthModule],
  exports: [PointsService],
})
export class PointsModule {}
