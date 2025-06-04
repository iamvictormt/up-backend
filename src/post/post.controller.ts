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

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req) {
    const userId = req.user.sub;
    return this.postService.findAll(userId);
  }

  @Get('community/:communityId')
  @UseGuards(JwtAuthGuard)
  async findAllByCommunity(@Req() request, @Param('communityId') communityId: string) {
    const userId = request.user.sub;
    return this.postService.findAllByCommunity(userId, communityId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(id);
  }
}
