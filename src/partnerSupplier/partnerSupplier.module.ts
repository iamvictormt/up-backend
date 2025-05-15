import { Module } from '@nestjs/common';
import { PartnerSupplierService } from './partnerSupplier.service';
import { PartnerSupplierController } from './partnerSupplier.controller';
import { UserModule } from '../user/user.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [UserModule, PrismaModule, MailModule],
  controllers: [PartnerSupplierController],
  providers: [PartnerSupplierService],
})
export class PartnerSupplierModule {}
