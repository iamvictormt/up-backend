import { Module } from '@nestjs/common';
import { ListedProfessionalService } from './listed-professional.service';
import { ListedProfessionalController } from './listed-professional.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ListedProfessionalController],
  providers: [ListedProfessionalService, PrismaService],
})
export class ListedProfessionalModule {}
