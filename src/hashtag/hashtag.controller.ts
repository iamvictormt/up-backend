import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HashtagService } from './hashtag.service';

@UseGuards(JwtAuthGuard)
@Controller('hashtags')
export class HashtagController {
  constructor(private readonly hashtagService: HashtagService) {}

  @Get('trending-topics')
  async findAll() {
    return this.hashtagService.findTrendingTopics();
  }
}
