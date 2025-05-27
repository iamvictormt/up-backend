import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLoveDecorationDto } from './dto/create-loveDecoration.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';

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

    const loveDecoration = await this.prisma.loveDecoration.create({
      data: {
        name: dto.name,
        contact: dto.contact,
        instagram: dto.instagram,
        tiktok: dto.tiktok || '',

        address: {
          create: dto.address,
        },
      },
      include: {
        address: true,
      },
    });

    const user = await this.userService.createUserWithRelation(
      userDto,
      undefined,
      undefined,
      loveDecoration.id,
    );

    return { loveDecoration, user };
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
