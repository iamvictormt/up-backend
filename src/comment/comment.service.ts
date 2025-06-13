import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDTO } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { NotificationType, Prisma } from '@prisma/client';
import { getUsername } from '../ultis';
import { NotificationService } from '../notification/notification.service';

type CommentWithUser = Prisma.CommentGetPayload<{
  include: {
    user: {
      select: {
        id: true,
        profileImage: true;
        loveDecoration: { select: { id: true; name: true } };
        professional: { select: { id: true; name: true } };
      };
    };
  };
}>;

@Injectable()
export class CommentService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async create(data: CreateCommentDTO, userId: string) {
    const comment = await this.prisma.comment.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            profileImage: true,
            loveDecoration: { select: { id: true, name: true } },
            professional: { select: { id: true, name: true } },
            partnerSupplier: { select: { tradeName: true } },
          },
        },
        post: {
          select: {
            id: true,
            title: true,
            author: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (comment.post.author.id != userId) {
      await this.notificationService.create({
        type: NotificationType.COMMENT,
        title: 'Novo comentário',
        message: `${getUsername(comment.user)} comentou seu post ${comment.post.title ? `sobre ${comment.post.title}` : ''}`,
        userId: userId,
        postId: comment.post.id,
      });
    }

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
            id: true,
            profileImage: true,
            loveDecoration: { select: { id: true, name: true } },
            professional: { select: { id: true, name: true } },
            partnerSupplier: { select: { tradeName: true } },
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
            id: true,
            profileImage: true,
            loveDecoration: { select: { id: true, name: true } },
            professional: { select: { id: true, name: true } },
            partnerSupplier: { select: { tradeName: true } },
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
    const authorName = getUsername(comment.user);
    const authorId = comment.user.id;

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
