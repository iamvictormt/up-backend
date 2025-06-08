import { Module } from '@nestjs/common';
import { PartnerSupplierService } from './partner-supplier.service';
import { PartnerSupplierController } from './partner-supplier.controller';
import { UserModule } from '../user/user.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [UserModule, JwtModule, PrismaModule, MailModule],
  controllers: [PartnerSupplierController],
  providers: [PartnerSupplierService],
})
export class PartnerSupplierModule {}
