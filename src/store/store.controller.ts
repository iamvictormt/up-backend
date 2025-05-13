import { Body, Controller, Post } from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post() async register(@Body() dto: CreateStoreDto) {
    return this.storeService.create(dto);
  }
}
