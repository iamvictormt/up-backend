import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { LoveDecorationService } from './loveDecoration.service';
import { CreateLoveDecorationDto } from './dto/create-loveDecoration.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Controller('love-decoration')
export class LoveDecorationController {
  constructor(private readonly loveDecorationService: LoveDecorationService) {}

  @Post() async register(
    @Body('loveDecoration') dto: CreateLoveDecorationDto,
    @Body('user') userDto: CreateUserDto,
  ) {
    return this.loveDecorationService.create(dto, userDto);
  }

  @Get() async findAll() {
    return this.loveDecorationService.findAll();
  }

  @Get(':id') async findOne(@Param('id') id: string) {
    return this.loveDecorationService.findOne(id);
  }
}
