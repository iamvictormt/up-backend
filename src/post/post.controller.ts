import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreatePostDTO } from './dto/create-post.dto';
import { PostService } from './post.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  register(@Body() data: CreatePostDTO) {
    return this.postService.create(data);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Req() request) {
    const userId = request.user.sub;
    return this.postService.findAll(userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(id);
  }
}
