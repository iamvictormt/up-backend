import { Controller, Get, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PointsService } from './points.service';

@Controller('points')
@UseGuards(JwtAuthGuard)
export class PointsController {
  constructor(
    private readonly pointsService: PointsService,
  ) {}

  @Get('history')
  async getHistory(
    @CurrentUser() user: any,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.pointsService.getHistoryByUserEmail(user.email, limit, { from, to });
  }
}
