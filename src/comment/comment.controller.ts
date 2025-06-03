import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDTO } from './dto/create-comment.dto';

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
  findAllByPostId(@Param('postId') postId: string) {
    return this.commentService.findAllByPostId(postId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentService.remove(id);
  }
}
