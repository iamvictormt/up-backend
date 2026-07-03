import { Module } from '@nestjs/common';
import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';
import { PartnerModule } from '../partner/partner.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PartnerModule, JwtModule],
  controllers: [SupplierController],
  providers: [SupplierService],
})
export class SupplierModule {}
