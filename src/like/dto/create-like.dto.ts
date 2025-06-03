import { IsString } from 'class-validator';

export class CreateLikeDTO {
  @IsString()
  userId: string;

  @IsString()
  postId: string;
}
