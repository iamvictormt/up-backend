import { Controller, Post, Body } from '@nestjs/common';
import { ShopkeeperService } from './shopkeeper.service';
import { CreateShopkeeperDto } from './dto/create-shopkeeper.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Controller('shopkeeper')
export class ShopkeeperController {
  constructor(private readonly shopkeeperService: ShopkeeperService) {}

  @Post()
  async registerShopkeeper(
    @Body('shopkeeper') shopkeeper: CreateShopkeeperDto,
    @Body('user') user: CreateUserDto,
  ) {
    return this.shopkeeperService.createShopkeeper(shopkeeper, user);
  }
}
