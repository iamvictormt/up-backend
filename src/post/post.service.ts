import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDTO } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Prisma } from '@prisma/client';
import { HashtagService } from '../hashtag/hashtag.service';

export type PostWithUser = Prisma.PostGetPayload<{
  include: {
    postHashtags: {
      include: {
        hashtag: true;
      };
    };
    author: {
      select: {
        profileImage: true;
        loveDecoration: { select: { id: true; name: true } };
        professional: { select: { id: true; name: true } };
      };
    };
    community: true;
    _count: {
      select: { likes: true; comments: true };
    };
    likes: {
      select: { userId: true };
    };
  };
}>;

@Injectable()
export class PostService {
  constructor(
    private prisma: PrismaService,
    private hashtagService: HashtagService,
  ) {}

  async create(data: CreatePostDTO) {
    const { hashtags, ...postData } = data;

    const post = await this.prisma.post.create({
      data: postData,
    });

    if (hashtags && hashtags.length > 0) {
      for (const tag of hashtags) {
        const hashtag = await this.prisma.hashtag.upsert({
          where: { name: tag },
          update: {},
          create: { name: tag },
        });

        await this.prisma.postHashtag.create({
          data: {
            postId: post.id,
            hashtagId: hashtag.id,
          },
        });
      }
    }

    return post;
  }

  async findAll(userId: string) {
    const posts = await this.prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: this.includesDefault(),
    });

    return posts.map((post) => this.formatPost(post, userId));
  }

  async findAllByCommunity(userId: string, communityId: string) {
    const posts = await this.prisma.post.findMany({
      where: {
        communityId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: this.includesDefault(),
    });

    return posts.map((post) => this.formatPost(post, userId));
  }

  private formatPost(post: PostWithUser, currentUserId?: string) {
    const authorName =
      post.author.loveDecoration?.name || post.author.professional?.name;

    const authorId =
      post.author.loveDecoration?.id || post.author.professional?.id;

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      hashtags: post.postHashtags.map((ph) => ph.hashtag.name),
      author: {
        id: authorId,
        name: authorName,
        profileImage: post.author.profileImage,
      },
      community: post.community,
      likes: post._count.likes,
      comments: post._count.comments,
      isLiked: post.likes.some((like: any) => like.userId === currentUserId),
      isMine: post.authorId === currentUserId,
    };
  }

  async update(id: string, dto: UpdatePostDto) {
    const { hashtags, ...postData } = dto;
    await this.hashtagService.remove(id);

    if (hashtags && hashtags.length > 0) {
      for (const tag of hashtags) {
        const hashtag = await this.prisma.hashtag.upsert({
          where: { name: tag },
          update: {},
          create: { name: tag },
        });

        await this.prisma.postHashtag.create({
          data: {
            postId: id,
            hashtagId: hashtag.id,
          },
        });
      }
    }

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: postData,
      include: this.includesDefault(),
    });

    return this.formatPost(updatedPost, dto.authorId);
  }

  private includesDefault() {
    return {
      postHashtags: {
        include: {
          hashtag: true,
        },
      },
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
    };
  }

  async remove(id: string) {
    await this.hashtagService.remove(id);

    return this.prisma.post.delete({
      where: { id },
    });
  }
}
