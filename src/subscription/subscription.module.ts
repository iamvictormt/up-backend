import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { SubscriptionsService } from './subscription.service';

@Module({
  imports: [JwtModule, PrismaModule],
  controllers: [],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService]
})
export class SubscriptionModule {}
