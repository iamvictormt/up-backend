import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDTO } from './create-post.dto';

export class UpdatePostDto extends PartialType(CreatePostDTO) {}
