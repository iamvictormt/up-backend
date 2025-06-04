import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDTO } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {
  }

  async create(data: CreateCommentDTO) {
    const comment = await this.prisma.comment.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            profileImage: true,
            loveDecoration: { select: { id: true, name: true } },
            professional: { select: { id: true, name: true } },
          },
        },
      },
    });

    const authorName = comment.user.loveDecoration?.name || comment.user.professional?.name;
    const authorId = comment.user.loveDecoration?.id || comment.user.professional?.id;

    return {
      id: comment.id,
      userId: authorId,
      postId: comment.postId,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      isMine: true,
      author: {
        id: authorId,
        name: authorName,
        profileImage: comment.user.profileImage,
      },
    };
  }

  async findAllByPostId(postId: string, userId: string) {
    const comments = await this.prisma.comment.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            profileImage: true,
            loveDecoration: { select: { id: true, name: true } },
            professional: { select: { id: true, name: true } },
          },
        },
      },
    });

    return comments.map((comment) => {
      const authorName =
        comment.user.loveDecoration?.name || comment.user.professional?.name;
      const authorId =
        comment.user.loveDecoration?.id || comment.user.professional?.id || '';
      const isMine = comment.userId === userId;

      return {
        id: comment.id,
        userId: authorId,
        postId: comment.postId,
        content: comment.content,
        createdAt: comment.createdAt,
        updateAt: comment.updatedAt,
        isMine,
        author: {
          id: authorId,
          name: authorName,
          profileImage: comment.user.profileImage,
        },
      };
    });
  }

  async update(id: string, dto: UpdateCommentDto) {
    return this.prisma.comment.update({
      where: { id },
      data: { content: dto.content },
    });
  }

  async remove(id: string) {
    return this.prisma.comment.delete({
      where: { id },
    });
  }
}
