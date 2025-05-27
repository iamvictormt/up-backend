import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { ProfessionalService } from './professional.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';

@Controller('professional')
export class ProfessionalController {
  constructor(private readonly professionalService: ProfessionalService) {}

  @Post()
  async registerProfessional(
    @Body('professional') dto: CreateProfessionalDto,
    @Body('user') userDto: CreateUserDto,
  ) {
    return this.professionalService.create(dto, userDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateProfessionalDto) {
    return this.professionalService.update(id, data);
  }

  @Get() async findAll() {
    return this.professionalService.findAll();
  }

  @Get(':id') async findOne(@Param('id') id: string) {
    return this.professionalService.findOne(id);
  }
}
