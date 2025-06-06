import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { PostService } from '../post/post.service';

@Injectable()
export class CommunityService {
  constructor(
    private prisma: PrismaService,
    private postService: PostService,
  ) {}

  async create(data: CreateCommunityDto) {
    return this.prisma.community.create({
      data,
    });
  }

  async findAll(userId: string) {
    const communities = await this.prisma.community.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    const defaultCommunity = {
      id: '',
      name: 'Meus posts',
      description: 'Todos os seus posts publicados.',
      color: '#4B7BEC',
      icon: 'User',
      postsCount: await this.postService.findCountAllMyPosts(userId),
    };

    return [
      defaultCommunity,
      ...communities.map((community) => ({
        id: community.id,
        name: community.name,
        description: community.description,
        postsCount: community._count.posts,
        color: community.color,
        icon: community.icon,
      })),
    ];
  }

  async remove(id: string) {
    return this.prisma.community.delete({
      where: { id },
    });
  }
}
