import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete, UseGuards,
} from '@nestjs/common';
import { ListedProfessionalService } from './listed-professional.service';
import { CreateListedProfessionalDto } from './dto/create-listed-professional.dto';
import { UpdateListedProfessionalDto } from './dto/update-listed-professional.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('listed-professionals')
export class ListedProfessionalController {
  constructor(private readonly service: ListedProfessionalService) {}

  @Post()
  create(@Body() createDto: CreateListedProfessionalDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateListedProfessionalDto,
  ) {
    return this.service.update(id, updateDto);
  }

  @Patch('/toggle-status/:id')
  async inativeProfessional(@Param('id') id: string) {
    return await this.service.toggleStatus(id)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
