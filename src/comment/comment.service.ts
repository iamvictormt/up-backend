import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDTO } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Prisma } from '@prisma/client';

type CommentWithUser = Prisma.CommentGetPayload<{
  include: {
    user: {
      select: {
        profileImage: true;
        loveDecoration: { select: { id: true; name: true } };
        professional: { select: { id: true; name: true } };
      };
    };
  };
}>;

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

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

    return this.formatComment(comment);
  }

  async findAllByPostId(postId: string, userId: string) {
    const comments = await this.prisma.comment.findMany({
      where: { postId },
      orderBy: {
        createdAt: 'desc',
      },
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

    return comments.map((comment) => this.formatComment(comment, userId));
  }

  async update(id: string, dto: UpdateCommentDto) {
    const comment = await this.prisma.comment.update({
      where: { id },
      data: { content: dto.content },
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

    return this.formatComment(comment, dto.userId);
  }

  async remove(id: string) {
    return this.prisma.comment.delete({
      where: { id },
    });
  }

  private formatComment(comment: CommentWithUser, currentUserId?: string) {
    const authorName =
      comment.user.loveDecoration?.name || comment.user.professional?.name;
    const authorId =
      comment.user.loveDecoration?.id || comment.user.professional?.id;

    return {
      id: comment.id,
      userId: authorId,
      postId: comment.postId,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      isMine: currentUserId ? comment.userId === currentUserId : true,
      author: {
        id: authorId,
        name: authorName,
        profileImage: comment.user.profileImage,
      },
    };
  }
}
