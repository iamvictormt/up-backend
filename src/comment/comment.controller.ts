import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDTO } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  register(@Body() data: CreateCommentDTO, @CurrentUser() user) {
    return this.commentService.create(data, user.sub);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateCommentDto) {
    return this.commentService.update(id, data);
  }

  @Get('post/:postId')
  findAllByPostId(@Param('postId') postId: string, @CurrentUser() user) {
    return this.commentService.findAllByPostId(postId, user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentService.remove(id);
  }
}
