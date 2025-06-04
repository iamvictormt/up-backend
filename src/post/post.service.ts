import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDTO } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreatePostDTO) {
    return this.prisma.post.create({
      data,
    });
  }

  async findAll(userId: string) {
    const posts = await this.prisma.post.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: {
            profileImage: true,
            loveDecoration: { select: { id: true, name: true } },
            professional: { select: { id: true, name: true } },
          },
        },
        community: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        likes: {
          where: {
            userId: userId,
          },
          select: {
            id: true,
          },
        },
      },
    });

    return posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      hashtags: post.hashtags,
      author: {
        id: post.author.loveDecoration?.id || post.author.professional?.id,
        name:
          post.author.loveDecoration?.name || post.author.professional?.name,
        profileImage: post.author.profileImage,
      },
      community: post.community,
      likes: post._count.likes,
      comments: post._count.comments,
      isLiked: post.likes.length > 0,
    }));
  }

  async findAllByCommunity(userId: string, communityId: string) {
    const posts = await this.prisma.post.findMany({
      where: {
        communityId,
      },
      include: {
        author: {
          select: {
            profileImage: true,
            loveDecoration: { select: { id: true, name: true } },
            professional: { select: { id: true, name: true } },
          },
        },
        community: {
          select: {
            name: true,
            description: true,
            color: true,
            icon: true,
          },
        },
        likes: {
          select: { id: true, userId: true },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });

    return posts.map((post) => {
      const authorName =
        post.author.loveDecoration?.name || post.author.professional?.name;
      const authorId =
        post.author.loveDecoration?.id || post.author.professional?.id || '';
      const userLike = post.likes.find((like) => like.userId === userId);
      const isMine = post.authorId === userId;

      return {
        id: post.id,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        hashtags: post.hashtags,
        author: {
          id: authorId,
          name: authorName,
          profileImage: post.author.profileImage,
        },
        likes: post._count.likes,
        comments: post._count.comments,
        community: post.community,
        isLiked: !!userLike,
        likeId: userLike?.id,
        isMine
      };
    });
  }

  async update(id: string, dto: UpdatePostDto) {
    return this.prisma.post.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.post.delete({
      where: { id },
    });
  }
}
