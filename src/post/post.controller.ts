import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreatePostDTO } from './dto/create-post.dto';
import { PostService } from './post.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdatePostDto } from './dto/update-post.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  register(@Body() data: CreatePostDTO) {
    return this.postService.create(data);
  }

  @Get()
  async findAll(@CurrentUser() user) {
    return this.postService.findAll(user.sub);
  }

  @Get('my-posts')
  async findAllMyPosts(@CurrentUser() user) {
    return this.postService.findAllMyPosts(user.sub);
  }

  @Get('my-posts-stats')
  async findAllMyPostsStats(@CurrentUser() user) {
    return this.postService.findAllMyPostsStats(user.sub);
  }

  @Get('community/:communityId')
  async findAllByCommunity(
    @CurrentUser() user,
    @Param('communityId') communityId: string,
  ) {
    return this.postService.findAllByCommunity(user.sub, communityId);
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
