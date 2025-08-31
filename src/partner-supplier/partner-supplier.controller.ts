import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PartnerSupplierService } from './partner-supplier.service';
import { CreatePartnerSupplierDto } from './dto/create-partner-supplier.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdatePartnerSupplierDto } from './dto/update-partner-supplier.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('partner-suppliers')
export class PartnerSupplierController {
  constructor(
    private readonly partnerSupplierService: PartnerSupplierService,
  ) {}

  @Post() async register(
    @Body('partnerSupplier') dto: CreatePartnerSupplierDto,
    @Body('user') userDto: CreateUserDto,
  ) {
    return await this.partnerSupplierService.create(dto, userDto);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  async update(@CurrentUser() user, @Body() dto: UpdatePartnerSupplierDto) {
    return await this.partnerSupplierService.update(user.sub, dto);
  }

  @Get() async findAll() {
    return await this.partnerSupplierService.findAll();
  }

  @Get('pending') async findPending() {
    return await this.partnerSupplierService.findAll();
  }

  @Get(':id') async findOne(@Param('id') id: string) {
    return await this.partnerSupplierService.findOne(id);
  }

  @Put('pending/:id') async updateAccessPending(
    @Param('id') id: string,
    @Body() updatePartnerSupplierDto: UpdatePartnerSupplierDto,
  ) {
    return await this.partnerSupplierService.updateAccessPending(
      id,
      updatePartnerSupplierDto,
    );
  }
}
