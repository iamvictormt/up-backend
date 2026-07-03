import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('suppliers')
export class SupplierController {
  constructor(private readonly service: SupplierService) {}

  @Post() async register(
    @Body('supplier') dto: CreateSupplierDto,
    @Body('user') userDto: CreateUserDto,
  ) {
    return this.service.create(dto, userDto);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  async update(@CurrentUser() user, @Body() dto: UpdateSupplierDto) {
    return this.service.update(user.sub, dto);
  }

  @Get() async findAll(
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('state') state?: string,
    @Query('city') city?: string,
  ) {
    return this.service.findAll(
      search,
      parseInt(page),
      parseInt(limit),
      state,
      city,
    );
  }
}
