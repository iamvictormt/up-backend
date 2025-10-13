import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { RecommendedProfessionalService } from './recommended-professional.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('recommended-professionals')
export class RecommendedProfessionalController {
  constructor(private readonly service: RecommendedProfessionalService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '6',
  ) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    return this.service.findAll({
      search,
      page: pageNumber,
      limit: limitNumber,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
