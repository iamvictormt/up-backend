import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post, Query,
  UseGuards,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post() async register(@Body() dto: CreateStoreDto) {
    return this.storeService.create(dto);
  }

  @Patch(':id/my-store')
  update(
    @CurrentUser() user,
    @Param('id') id: string,
    @Body() data: UpdateStoreDto,
  ) {
    return this.storeService.update(user.sub, data);
  }

  @Get('my-store') async findMyStore(@CurrentUser() user) {
    return this.storeService.findMyStore(user.sub);
  }

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);

    return this.storeService.findAll(search, pageNumber, pageSize);
  }

  @Get(':id') async findOne(@Param('id') id: string) {
    return this.storeService.findOne(id);
  }
}
