import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ProfessionalService } from './professional.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateProfessionalDto } from './dto/update-professional.dto';

@Controller('professionals')
export class ProfessionalController {
  constructor(private readonly professionalService: ProfessionalService) {}

  @Post()
  async registerProfessional(
    @Body('professional') dto: CreateProfessionalDto,
    @Body('user') userDto: CreateUserDto,
  ) {
    return this.professionalService.create(dto, userDto);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  async update(@CurrentUser() user, @Body() dto: UpdateProfessionalDto) {
    return await this.professionalService.update(user.sub, dto);
  }

  @Patch(':professionalId')
  @UseGuards(JwtAuthGuard)
  async updateProfessional(
    @Param('professionalId') professionalId: string,
    @Body() dto: UpdateProfessionalDto,
  ) {
    return await this.professionalService.updateProfessional(professionalId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.professionalService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.professionalService.findOne(id);
  }
}
