import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { WellnessCategoryService } from './wellness-category.service';
import { CreateWellnessCategoryDto } from './dto/create-wellness-category.dto';

@Controller('wellness-categories')
export class WellnessCategoryController {
  constructor(
    private readonly wellnessCategoryService: WellnessCategoryService,
  ) {}

  @Post()
  register(@Body() data: CreateWellnessCategoryDto) {
    return this.wellnessCategoryService.create(data);
  }

  @Get()
  findAll() {
    return this.wellnessCategoryService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wellnessCategoryService.remove(id);
  }
}
