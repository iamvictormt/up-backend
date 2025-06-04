import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommunityDto } from './dto/create-community.dto';

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCommunityDto) {
    return this.prisma.community.create({
      data,
    });
  }

  async findAll() {
    const communities = await this.prisma.community.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    return communities.map((community) => ({
      id: community.id,
      name: community.name,
      description: community.description,
      postsCount: community._count.posts,
      color: community.color,
      icon: community.icon,
    }));
  }

  async remove(id: string) {
    return this.prisma.community.delete({
      where: { id },
    });
  }
}
