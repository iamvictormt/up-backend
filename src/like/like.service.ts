import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLikeDTO } from './dto/create-like.dto';

@Injectable()
export class LikeService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateLikeDTO) {
    return this.prisma.like.create({
      data,
    });
  }

  async findAllByPostId(postId: string) {
    return this.prisma.like.findMany({
      where: { postId },
      include: { user: true },
    });
  }

  async remove(id: string) {
    return this.prisma.like.delete({
      where: { id },
    });
  }
}
