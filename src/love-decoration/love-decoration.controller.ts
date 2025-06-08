import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LoveDecorationService } from './love-decoration.service';
import { CreateLoveDecorationDto } from './dto/create-love-decoration.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdateLoveDecorationDto } from './dto/update-love-decoration.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('love-decorations')
export class LoveDecorationController {
  constructor(private readonly loveDecorationService: LoveDecorationService) {}

  @Post() async register(
    @Body('loveDecoration') dto: CreateLoveDecorationDto,
    @Body('user') userDto: CreateUserDto,
  ) {
    return this.loveDecorationService.create(dto, userDto);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  update(@CurrentUser() user, @Body() dto: UpdateLoveDecorationDto) {
    return this.loveDecorationService.update(user.sub, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.loveDecorationService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.loveDecorationService.findOne(id);
  }
}
