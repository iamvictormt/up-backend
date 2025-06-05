import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StoreService } from './store.service';
import { UserModule } from '../user/user.module';
import { StoreController } from './store.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule, UserModule, PrismaModule],
  controllers: [StoreController],
  providers: [StoreService],
})
export class StoreModule {}
