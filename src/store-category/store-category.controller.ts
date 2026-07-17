import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { StoreCategoryService } from './store-category.service';
import { CreateStoreCategoryDto } from './dto/create-store-category.dto';

@Controller('store-categories')
export class StoreCategoryController {
  constructor(private readonly storeCategoryService: StoreCategoryService) {}

  @Post()
  register(@Body() data: CreateStoreCategoryDto) {
    return this.storeCategoryService.create(data);
  }

  @Get()
  findAll() {
    return this.storeCategoryService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storeCategoryService.remove(id);
  }
}
