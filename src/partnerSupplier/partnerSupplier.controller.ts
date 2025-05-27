import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PartnerSupplierService } from './partnerSupplier.service';
import { CreatePartnerSupplierDto } from './dto/create-partnerSupplier.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdatePartnerSupplierDto } from './dto/update-partnerSupplier.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

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
