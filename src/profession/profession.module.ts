import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProfessionController } from './profession.controller';
import { ProfessionService } from './profession.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule, PrismaModule],
  controllers: [ProfessionController],
  providers: [ProfessionService],
})
export class ProfessionModule {}
