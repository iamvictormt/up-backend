import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { getUsername } from '../ultis';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        type: dto.type,
        title: dto.title,
        message: dto.message,
        isRead: false,
        user: { connect: { id: dto.userId } },
        post: { connect: { id: dto.postId } },
      },
    });
  }

  async updateRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async updateAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  async findAll(loggedUserId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: {
        post: {
          authorId: loggedUserId,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        user: {
          select: {
            id: true,
            professional: true,
            loveDecoration: true,
            partnerSupplier: true,
            profileImage: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return notifications.map((notification) => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead,
      createdAt: notification.createdAt.toISOString(),
      user: {
        id: notification.user.id,
        name: getUsername(notification.user),
        avatar: notification.user.profileImage,
      },
      post: notification.post,
    }));
  }
}
