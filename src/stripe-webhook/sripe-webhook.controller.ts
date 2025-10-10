import { Controller, Post, Req, Res, Headers, Logger } from '@nestjs/common';
import { SubscriptionsService } from '../subscription/subscription.service';
import { Request, Response } from 'express';
import Stripe from 'stripe';

@Controller('webhook')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');

  constructor(private readonly subscriptionService: SubscriptionsService) {}

  @Post('stripe')
  async handleWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') sig: string,
  ) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      this.logger.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.subscriptionService.upsertSubscriptionFromStripe(
          event.data.object as Stripe.Subscription,
        );
        break;

      case 'customer.subscription.deleted':
        await this.subscriptionService.upsertSubscriptionFromStripe({
          ...(event.data.object as Stripe.Subscription),
          status: 'canceled',
        });
        break;
    }

    return res.status(200).json({ received: true });
  }
}
