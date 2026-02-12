import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLoveDecorationDto } from './dto/create-love-decoration.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { UpdateLoveDecorationDto } from './dto/update-love-decoration.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';

@Injectable()
export class LoveDecorationService {
  constructor(
    private readonly prisma: PrismaService,
    private userService: UserService,
  ) {}

  async create(dto: CreateLoveDecorationDto, userDto: CreateUserDto) {
    const emailExists = await this.userService.checkIfEmailExists(
      userDto.email,
    );
    if (emailExists) {
      throw new ConflictException('Email já cadastrado.');
    }

    const hashedPassword = await this.userService.hashPassword(userDto.password);

    return await this.prisma.$transaction(async (tx) => {
      const loveDecoration = await tx.loveDecoration.create({
        data: {
          name: dto.name,
          contact: dto.contact,
          instagram: dto.instagram,
          tiktok: dto.tiktok || '',
        },
      });

      const user = await this.userService.createUserWithRelation(
        userDto,
        undefined,
        undefined,
        loveDecoration.id,
        tx,
        hashedPassword,
      );

      return { loveDecoration, user };
    });
  }

  async update(
    userId: string,
    dto: UpdateLoveDecorationDto,
  ) {
    const user = await this.userService.findOne(userId);

    if (!user || !user.loveDecoration) {
      throw new NotFoundException('Amo decoração não encontrado!');
    }

    const updatedLoveDecoration = await this.prisma.loveDecoration.update({
      where: { id: user.loveDecoration.id },
      data: { ...dto },
      select: {
        user: {
          select: {
            id: true,
            profileImage: true,
            loveDecoration: true,
            address: true,
          },
        },
      },
    });

    return updatedLoveDecoration.user;
  }

  async findAll() {
    return this.prisma.loveDecoration.findMany({});
  }

  async findOne(id: string) {
    return this.prisma.loveDecoration.findUnique({
      where: { id },
    });
  }
}
