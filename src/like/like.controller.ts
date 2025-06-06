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
import { LikeService } from './like.service';
import { CreateLikeDTO } from './dto/create-like.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('likes')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post()
  register(@Body() data: CreateLikeDTO, @CurrentUser() user) {
    return this.likeService.create(data, user.sub);
  }

  @Get('post/:postId')
  findAllByPostId(@Param('postId') postId: string) {
    return this.likeService.findAllByPostId(postId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.likeService.remove(id);
  }
}
