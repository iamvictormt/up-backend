import {
  Body,
  Controller,
  Get,
  Param, Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { LoveDecorationService } from './loveDecoration.service';
import { CreateLoveDecorationDto } from './dto/create-loveDecoration.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdateLoveDecorationDto } from './dto/update-loveDecoration.dto';

@Controller('love-decoration')
export class LoveDecorationController {
  constructor(private readonly loveDecorationService: LoveDecorationService) {}

  @Post() async register(
    @Body('loveDecoration') dto: CreateLoveDecorationDto,
    @Body('user') userDto: CreateUserDto,
  ) {
    return this.loveDecorationService.create(dto, userDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateLoveDecorationDto) {
    return this.loveDecorationService.update(id, data);
  }

  @Get() async findAll() {
    return this.loveDecorationService.findAll();
  }

  @Get(':id') async findOne(@Param('id') id: string) {
    return this.loveDecorationService.findOne(id);
  }
}
