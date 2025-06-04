import {
  Body,
  Controller,
  Delete,
  Get,
  Param, Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreatePostDTO } from './dto/create-post.dto';
import { PostService } from './post.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdatePostDto } from './dto/update-post.dto';

@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  register(@Body() data: CreatePostDTO) {
    return this.postService.create(data);
  }

  @Get()
  async findAll(@Req() req) {
    const userId = req.user.sub;
    return this.postService.findAll(userId);
  }

  @Get('community/:communityId')
  async findAllByCommunity(
    @Req() request,
    @Param('communityId') communityId: string,
  ) {
    const userId = request.user.sub;
    return this.postService.findAllByCommunity(userId, communityId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdatePostDto) {
    return this.postService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(id);
  }
}
