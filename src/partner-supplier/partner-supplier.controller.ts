import { Body, Controller, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { PartnerSupplierService } from './partner-supplier.service';
import { CreatePartnerSupplierDto } from './dto/create-partner-supplier.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdatePartnerSupplierDto } from './dto/update-partner-supplier.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateLoveDecorationDto } from '../love-decoration/dto/update-love-decoration.dto';

@Controller('partner-suppliers')
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

  @Patch()
  @UseGuards(JwtAuthGuard)
  update(@CurrentUser() user, @Body() dto: UpdatePartnerSupplierDto) {
    return this.partnerSupplierService.update(user.sub, dto);
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
