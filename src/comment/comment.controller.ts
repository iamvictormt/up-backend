import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Patch, UseGuards, Req,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDTO } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  register(@Body() data: CreateCommentDTO) {
    return this.commentService.create(data);
  }

  @Patch('comment/:id')
  update(@Param('id') id: string, @Body() data: CreateCommentDTO) {
    return this.commentService.update(id, data);
  }

  @Get('post/:postId')
  findAllByPostId(@Req() request, @Param('postId') postId: string) {
    const userId: string = request.user.sub;
    return this.commentService.findAllByPostId(postId, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentService.remove(id);
  }
}
