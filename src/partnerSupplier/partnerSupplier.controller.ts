import { Controller, Post, Body } from '@nestjs/common';
import { PartnerSupplierService } from './partnerSupplier.service';
import { CreatePartnerSupplierDto } from './dto/create-partnerSupplier.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Controller('partner-supplier')
export class PartnerSupplierController {
  constructor(private readonly partnerSupplierService: PartnerSupplierService) {}

  @Post()
  async registerPartnerSupplier(
    @Body('partnerSupplier') partnerSupplier: CreatePartnerSupplierDto,
    @Body('user') user: CreateUserDto,
  ) {
    return this.partnerSupplierService.createPartnerSupplier(partnerSupplier, user);
  }
}
