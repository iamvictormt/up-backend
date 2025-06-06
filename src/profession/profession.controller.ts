import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProfessionService } from './profession.service';
import { CreateProfessionDto } from './dto/create-profession.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('professions')
export class ProfessionController {
  constructor(private readonly professionService: ProfessionService) {}

  @Post()
  register(@Body() data: CreateProfessionDto) {
    return this.professionService.create(data);
  }

  @Get()
  findAllByPostId(@Param('postId') postId: string) {
    return this.professionService.findAll(postId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.professionService.remove(id);
  }
}
