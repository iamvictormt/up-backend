import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateCommunityDto } from './dto/create-community.dto';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('communities')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post()
  register(@Body() data: CreateCommunityDto) {
    return this.communityService.create(data);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.communityService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.communityService.remove(id);
  }
}
