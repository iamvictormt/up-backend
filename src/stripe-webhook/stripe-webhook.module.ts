import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { StripeWebhookController } from './sripe-webhook.controller';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [JwtModule, UserModule, SubscriptionModule, PrismaModule],
  controllers: [StripeWebhookController],
  providers: [],
})
export class StripeWebhookModule {}
