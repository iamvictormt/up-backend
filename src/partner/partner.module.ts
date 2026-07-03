import { Module } from '@nestjs/common';
import { PartnerBaseService } from './partner-base.service';
import { UserModule } from '../user/user.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [UserModule, PrismaModule],
  providers: [PartnerBaseService],
  exports: [PartnerBaseService],
})
export class PartnerModule {}
