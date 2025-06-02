import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { LoveDecorationService } from './love-decoration.service';
import { CreateLoveDecorationDto } from './dto/create-love-decoration.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdateLoveDecorationDto } from './dto/update-love-decoration.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';

@Controller('love-decorations')
export class LoveDecorationController {
  constructor(private readonly loveDecorationService: LoveDecorationService) {}

  @Post() async register(
    @Body('loveDecoration') dto: CreateLoveDecorationDto,
    @Body('user') userDto: CreateUserDto,
  ) {
    return this.loveDecorationService.create(dto, userDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body('loveDecoration') dto: UpdateLoveDecorationDto,
    @Body('user') userDto: UpdateUserDto,
  ) {
    return this.loveDecorationService.update(id, dto, userDto);
  }

  @Get() async findAll() {
    return this.loveDecorationService.findAll();
  }

  @Get(':id') async findOne(@Param('id') id: string) {
    return this.loveDecorationService.findOne(id);
  }
}
