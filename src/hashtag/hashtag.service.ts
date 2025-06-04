import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HashtagService {
  constructor(private prisma: PrismaService) {}

  async findTrendingTopics() {
    const trendingHashtags = await this.prisma.hashtag.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { postHashtags: true },
        },
      },
      orderBy: {
        postHashtags: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    return trendingHashtags.map(h => ({
      id: h.id,
      tag: h.name,
      count: h._count.postHashtags,
    }));
  }

  async remove(postId: string) {
    const postHashtags = await this.prisma.postHashtag.findMany({
      where: { postId },
      select: { hashtagId: true },
    });

    const hashtagIds = postHashtags.map(ph => ph.hashtagId);

    await this.prisma.postHashtag.deleteMany({
      where: { postId },
    });

    await this.prisma.hashtag.deleteMany({
      where: { id: { in: hashtagIds } },
    });
  }
}
