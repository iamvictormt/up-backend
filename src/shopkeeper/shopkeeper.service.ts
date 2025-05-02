import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateShopkeeperDto } from './dto/create-shopkeeper.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ShopkeeperService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async createShopkeeper(shopkeeperDto: CreateShopkeeperDto, userDto: CreateUserDto) {
    const emailExists = await this.userService.checkIfEmailExists(userDto.email);

    if (emailExists) {
      throw new ConflictException('Email já cadastrado.');
    }

    const shopkeeper = await this.prisma.shopkeeper.create({
      data: {
        name: shopkeeperDto.name,
        document: shopkeeperDto.document,
        phone: shopkeeperDto.phone,
        segment: shopkeeperDto.segment,
      },
    });

    const user = await this.userService.createUserWithRelation(userDto, shopkeeper.id, undefined);
    return { shopkeeper, user };
  }
}
