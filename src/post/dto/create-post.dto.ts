import { IsString, IsOptional, IsArray, ArrayNotEmpty } from 'class-validator';

export class CreatePostDTO {
  @IsString()
  @IsOptional()
  attachedImage: string;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  authorId: string;

  @IsString()
  image: string;

  @IsString()
  communityId: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  hashtags?: string[];
}
