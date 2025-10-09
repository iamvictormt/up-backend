import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RecommendedProfessionalService } from './recommended-professional.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
@UseGuards(JwtAuthGuard)
@Controller('recommended-professionals')
export class RecommendedProfessionalController {
  constructor(private readonly service: RecommendedProfessionalService) {}

  // @Post()
  // create(@Body() createDto: CreateRecommendedProfessionalDto) {
  //   return this.service.create(createDto);
  // }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateDto: UpdateRecommendedProfessionalDto,
  // ) {
  //   return this.service.update(id, updateDto);
  // }

  // @Patch('/toggle-status/:id')
  // async inativeProfessional(@Param('id') id: string) {
  //   return await this.service.toggleStatus(id)
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.service.remove(id);
  // }
}
