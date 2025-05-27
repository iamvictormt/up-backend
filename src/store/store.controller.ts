import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post() async register(@Body() dto: CreateStoreDto) {
    return this.storeService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateStoreDto) {
    return this.storeService.update(id, data);
  }

  @Get() async findAll() {
    return this.storeService.findAll();
  }

  @Get(':id') async findOne(@Param('id') id: string) {
    return this.storeService.findOne(id);
  }
}
