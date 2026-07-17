import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WellnessService } from './wellness.service';
import { CreateWellnessDto } from './dto/create-wellness.dto';
import { UpdateWellnessDto } from './dto/update-wellness.dto';
import { CreateOfferingDto, UpdateOfferingDto } from './dto/offering.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('wellness')
export class WellnessController {
  constructor(private readonly service: WellnessService) {}

  @Post() async register(
    @Body('wellness') dto: CreateWellnessDto,
    @Body('user') userDto: CreateUserDto,
  ) {
    return this.service.create(dto, userDto);
  }

  @Get() async findAll(
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('state') state?: string,
    @Query('city') city?: string,
    @Query('category') category?: string,
  ) {
    return this.service.findAll(search, parseInt(page), parseInt(limit), state, city, category);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async findMe(@CurrentUser() user) {
    return this.service.findMe(user.sub);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  async update(@CurrentUser() user, @Body() dto: UpdateWellnessDto) {
    return this.service.update(user.sub, dto);
  }

  @Post('services')
  @UseGuards(JwtAuthGuard)
  async createOffering(@CurrentUser() user, @Body() dto: CreateOfferingDto) {
    return this.service.createOffering(user.sub, dto);
  }

  @Patch('services/:id')
  @UseGuards(JwtAuthGuard)
  async updateOffering(
    @CurrentUser() user,
    @Param('id') id: string,
    @Body() dto: UpdateOfferingDto,
  ) {
    return this.service.updateOffering(user.sub, id, dto);
  }

  @Delete('services/:id')
  @UseGuards(JwtAuthGuard)
  async deleteOffering(@CurrentUser() user, @Param('id') id: string) {
    return this.service.deleteOffering(user.sub, id);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  async toggleFavorite(@CurrentUser() user, @Param('id') wellnessId: string) {
    return this.service.toggleFavorite(user.sub, wellnessId);
  }

  @Get(':id') async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
