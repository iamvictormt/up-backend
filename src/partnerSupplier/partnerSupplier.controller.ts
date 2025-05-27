import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { PartnerSupplierService } from './partnerSupplier.service';
import { CreatePartnerSupplierDto } from './dto/create-partnerSupplier.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdatePartnerSupplierDto } from './dto/update-partnerSupplier.dto';

@Controller('partner-supplier')
export class PartnerSupplierController {
  constructor(
    private readonly partnerSupplierService: PartnerSupplierService,
  ) {}

  @Post() async register(
    @Body('partnerSupplier') dto: CreatePartnerSupplierDto,
    @Body('user') userDto: CreateUserDto,
  ) {
    return this.partnerSupplierService.create(dto, userDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdatePartnerSupplierDto) {
    return this.partnerSupplierService.update(id, data);
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

  @Put('pending/:id') async updateAccessPending(
    @Param('id') id: string,
    @Body() updatePartnerSupplierDto: UpdatePartnerSupplierDto,
  ) {
    return this.partnerSupplierService.updateAccessPending(
      id,
      updatePartnerSupplierDto,
    );
  }
}
