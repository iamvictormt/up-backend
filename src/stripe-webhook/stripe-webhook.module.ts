import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StripeWebhookController } from './sripe-webhook.controller';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [SubscriptionModule, PrismaModule],
  controllers: [StripeWebhookController],
  providers: [],
})
export class StripeWebhookModule {}
