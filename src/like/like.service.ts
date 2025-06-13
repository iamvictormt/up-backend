import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLikeDTO } from './dto/create-like.dto';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '@prisma/client';
import { getUsername } from '../ultis';

@Injectable()
export class LikeService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async create(data: CreateLikeDTO, userId: string) {
    const like = await this.prisma.like.create({
      data,
      include: {
        post: {
          select: {
            id: true,
            title: true,
            author: true,
          },
        },
        user: {
          select: {
            loveDecoration: true,
            professional: true,
            partnerSupplier: true,
          },
        },
      },
    });

    if (like.post.author.id != userId) {
      await this.notificationService.create({
        type: NotificationType.LIKE,
        title: 'Nova curtida',
        message: `${getUsername(like.user)} curtiu seu post ${like.post.title ? `sobre ${like.post.title}` : ''}`,
        userId: userId,
        postId: like.post.id,
      });
    }
  }

  async findAllByPostId(postId: string) {
    return this.prisma.like.findMany({
      where: { postId },
      include: { user: true },
    });
  }

  async remove(postId: string) {
    return this.prisma.like.deleteMany({
      where: { postId },
    });
  }
}
