import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { PartnerSupplierService } from './partnerSupplier.service';
import { CreatePartnerSupplierDto } from './dto/createPartnerSupplier.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdatePartnerSupplierDto } from './dto/updatePartnerSupplier.dto';

@Controller('partner-supplier')
export class PartnerSupplierController {
  constructor(
    private readonly partnerSupplierService: PartnerSupplierService,
  ) {}

  @Post() async register(
    @Body('partnerSupplier') partnerSupplier: CreatePartnerSupplierDto,
    @Body('user') user: CreateUserDto,
  ) {
    return this.partnerSupplierService.createPartnerSupplier(
      partnerSupplier,
      user,
    );
  }

  @Get() async findAll() {
    return this.partnerSupplierService.findAll();
  }

  @Get('pending') async findPending() {
    return this.partnerSupplierService.findPending();
  }

  @Get(':id') async findOne(@Param('id') id: string) {
    return this.partnerSupplierService.findOne(id);
  }

  @Put(':id') async updateAccessPending(
    @Param('id') id: string,
    @Body() updatePartnerSupplierDto: UpdatePartnerSupplierDto,
  ) {
    return this.partnerSupplierService.updateAccessPending(
      id,
      updatePartnerSupplierDto,
    );
  }
}
