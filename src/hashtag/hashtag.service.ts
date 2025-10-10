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
      take: 5,
    });

    return trendingHashtags.map((h) => ({
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

    const hashtagIds = postHashtags.map((ph) => ph.hashtagId);
    const stillUsedHashtags = await this.prisma.postHashtag.findMany({
      where: {
        hashtagId: { in: hashtagIds },
      },
      select: { hashtagId: true },
    });

    const stillUsedIds = new Set(stillUsedHashtags.map((h) => h.hashtagId));
    const toDelete = hashtagIds.filter((id) => !stillUsedIds.has(id));

    if (toDelete.length > 0) {
      await this.prisma.hashtag.deleteMany({
        where: { id: { in: toDelete } },
      });
    }
  }
}
