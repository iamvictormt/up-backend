import {
  Controller,
  Post,
  Headers,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Controller('webhook')
export class StripeWebhookController {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  constructor(private readonly prisma: PrismaService) {}

  @Post('stripe')
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    const buf = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Uint8Array[] = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => resolve(Buffer.concat(chunks)));
      req.on('error', reject);
    });

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        buf,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const subscription: any = event.data.object;
    const stripeCustomerId = subscription.customer?.toString();
    const subscriptionId = subscription.id;
    const status = subscription.status.toUpperCase();
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    const planName =
      typeof subscription.plan.product === 'object'
        ? subscription.plan.product.name
        : 'UNKNOWN';

    const existing = await this.prisma.subscription.findFirst({
      where: { stripeCustomerId },
    });

    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          if (existing) {
            await this.prisma.subscription.update({
              where: { id: existing.id },
              data: {
                subscriptionId,
                subscriptionStatus: status,
                currentPeriodEnd,
                planType: planName,
              },
            });
          } else {
            const partnerSupplierId =
              await this.getPartnerIdByStripeCustomer(stripeCustomerId);

            await this.prisma.subscription.create({
              data: {
                subscriptionId,
                stripeCustomerId,
                subscriptionStatus: status,
                currentPeriodEnd,
                planType: planName,
                partnerSupplierId,
              },
            });
          }
          break;
        }

        case 'customer.subscription.deleted': {
          if (existing) {
            await this.prisma.subscription.update({
              where: { id: existing.id },
              data: {
                subscriptionStatus: 'CANCELED',
              },
            });
          }
          break;
        }
      }

      return res.status(200).send('Webhook processed');
    } catch (error) {
      console.error('❌ Error processing webhook:', error);
      return res.status(500).send('Internal Server Error');
    }
  }

  private async getPartnerIdByStripeCustomer(stripeCustomerId: string): Promise<string> {
    const customer: any = await this.stripe.customers.retrieve(stripeCustomerId);
    if (!customer || typeof customer.email !== 'string') {
      throw new Error('Cliente Stripe não encontrado ou sem email');
    }

    const email = customer?.email;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        partnerSupplier: true,
      },
    });

    if (!user || !user.partnerSupplier) {
      throw new Error('User ou Fornecedor Parceiro não encontrado com esse email');
    }

    return user.partnerSupplier.id;
  }
}
