import { Module } from '@nestjs/common';
import { ShopkeeperService } from './shopkeeper.service';
import { ShopkeeperController } from './shopkeeper.controller';
import { UserModule } from '../user/user.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [UserModule, PrismaModule],
  controllers: [ShopkeeperController],
  providers: [ShopkeeperService],
})
export class ShopkeeperModule {}
