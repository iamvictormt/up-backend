import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDTO } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Prisma } from '@prisma/client';
import { HashtagService } from '../hashtag/hashtag.service';
import { getUsername } from '../ultis';

export type PostWithUser = Prisma.PostGetPayload<{
  include: {
    postHashtags: {
      include: {
        hashtag: true;
      };
    };
    author: {
      select: {
        id: true;
        profileImage: true;
        loveDecoration: { select: { id: true; name: true } };
        professional: { select: { id: true; name: true } };
        partnerSupplier: { select: { id: true; tradeName: true } };
      };
    };
    community: true;
    _count: {
      select: { likes: true; comments: true };
    };
    likes: {
      select: { id: true; userId: true };
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

  async findCountAllMyPosts(userId: string) {
    return this.prisma.post.count({
      where: { authorId: userId },
    });
  }

  async findAllMyPosts(userId: string) {
    const posts = await this.prisma.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      include: this.includesDefault(),
    });

    return posts.map((post) => this.formatPost(post, userId));
  }

  async findAllMyPostsStats(userId: string) {
    const posts = await this.prisma.post.findMany({
      where: { authorId: userId },
      select: {
        id: true,
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    const postsCount = posts.length;
    const commentsCount = posts.reduce(
      (sum, post) => sum + post._count.comments,
      0,
    );
    const likesCount = posts.reduce((sum, post) => sum + post._count.likes, 0);

    return {
      postsCount,
      commentsCount,
      likesCount,
    };
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
    const authorName = getUsername(post.author);
    const authorId = post.author.id;
    const userLike = post.likes.find((like) => like.userId === currentUserId);
    const likeId = userLike ? userLike.id : null;

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
      isLiked: !!userLike,
      likeId: likeId,
      isMine: post.authorId === currentUserId,
      attachedImage: post.attachedImage,
    };
  }

  async update(id: string, dto: UpdatePostDto) {
    const { hashtags, ...postData } = dto;
    await this.hashtagService.remove(id);

    if (hashtags && hashtags.length > 0) {
      for (const tag of hashtags) {
        await this.prisma.hashtag.upsert({
          where: { name: tag },
          update: {},
          create: { name: tag },
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
          id: true,
          profileImage: true,
          loveDecoration: { select: { id: true, name: true } },
          professional: { select: { id: true, name: true } },
          partnerSupplier: { select: { id: true, tradeName: true } },
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
