import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDTO } from './dto/create-post.dto';

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
      include: {
        author: {
          select: {
            profileImage: true,
            loveDecoration: { select: { id: true, name: true } },
            professional: { select: { id: true, name: true } },
          },
        },
        likes: {
          select: { userId: true }, // para verificar se o user curtiu
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
      const isLiked = post.likes.some((like) => like.userId === userId);

      return {
        id: post.id,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        likes: post._count.likes,
        comments: post._count.comments,
        hashtags: post.hashtags,
        isLiked,
        author: {
          id: authorId,
          name: authorName,
          profileImage: post.author.profileImage,
        },
      };
    });
  }

  async remove(id: string) {
    return this.prisma.post.delete({
      where: { id },
    });
  }
}
