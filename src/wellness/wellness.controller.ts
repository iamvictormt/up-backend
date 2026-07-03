import {
  Body,
  Controller,
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
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { PartnerBaseService } from '../partner/partner-base.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('wellness')
export class WellnessController {
  constructor(
    private readonly service: WellnessService,
    private readonly base: PartnerBaseService,
  ) {}

  @Post() async register(
    @Body('wellness') dto: CreateWellnessDto,
    @Body('user') userDto: CreateUserDto,
  ) {
    return this.service.create(dto, userDto);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  async update(@CurrentUser() user, @Body() dto: UpdateWellnessDto) {
    return this.service.update(user.sub, dto);
  }

  @Get() async findAll(
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('state') state?: string,
    @Query('city') city?: string,
  ) {
    return this.service.findAll(
      search,
      parseInt(page),
      parseInt(limit),
      state,
      city,
    );
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  async toggleFavorite(@CurrentUser() user, @Param('id') partnerId: string) {
    const professionalId = await this.base.findProfessionalIdByUserId(
      user.sub,
    );
    return this.base.toggleFavorite(professionalId, partnerId);
  }
}
