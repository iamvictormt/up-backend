import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { LikeService } from './like.service';
import { CreateLikeDTO } from './dto/create-like.dto';

@Controller('likes')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post()
  register(@Body() data: CreateLikeDTO) {
    return this.likeService.create(data);
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
