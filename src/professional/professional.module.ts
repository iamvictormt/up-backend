import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ProfessionalController } from './professional.controller';
import { ProfessionalService } from './professional.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule, UserModule, PrismaModule],
  controllers: [ProfessionalController],
  providers: [ProfessionalService],
})
export class ProfessionalModule {}
