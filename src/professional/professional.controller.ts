import { Controller, Post, Body } from '@nestjs/common';
import { ProfessionalService } from './professional.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Controller('professional')
export class ProfessionalController {
  constructor(private readonly professionalService: ProfessionalService) {}

  @Post()
  async registerProfessional(
    @Body('professional') professional: CreateProfessionalDto,
    @Body('user') user: CreateUserDto,
  ) {
    return this.professionalService.createProfessional(professional, user);
  }
}
