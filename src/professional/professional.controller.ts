import { Controller, Post, Body } from '@nestjs/common';
import { ProfessionalService } from './professional.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

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
}
