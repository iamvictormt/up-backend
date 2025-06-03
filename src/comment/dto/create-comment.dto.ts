import { IsString } from 'class-validator';

export class CreateCommentDTO {
  @IsString()
  userId: string;

  @IsString()
  postId: string;

  @IsString()
  content: string;
}
