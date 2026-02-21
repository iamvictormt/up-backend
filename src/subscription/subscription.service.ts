import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';
import { getPlanType } from '../ultis/subscription.util';
import { getNextPeriodEnd } from '../ultis/date.util';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');
  }

  async upsertSubscriptionFromStripe(data: any) {
    const {
      customer: stripeCustomerId,
      id: subscriptionId,
      status,
      cancel_at_period_end,
      plan,
    } = data;

    let customerData;
    const periodEnd = getNextPeriodEnd(new Date());
    try {
      customerData = await this.stripe.customers.retrieve(stripeCustomerId);
    } catch (error) {
      this.logger.error(`❌ Erro ao buscar cliente Stripe: ${error.message}`);
      return;
    }

    const email = (customerData as any).email;
    if (!email) {
      this.logger.warn(`⚠️ Email não encontrado no cliente Stripe`);
      return;
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { partnerSupplier: true },
    });

    if (!user || !user.partnerSupplier) {
      this.logger.warn(
        `⚠️ Usuário com email ${email} ou parceiro não encontrado`,
      );
      return;
    }

    const partnerSupplier = user.partnerSupplier;

    await this.prisma.subscription.upsert({
      where: {
        partnerSupplierId: partnerSupplier.id,
      },
      update: {
        subscriptionId,
        subscriptionStatus: status.toUpperCase(),
        planType: getPlanType(plan.amount.toString()),
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: cancel_at_period_end ?? false,
        isManual: false,
      },
      create: {
        partnerSupplierId: partnerSupplier.id,
        stripeCustomerId,
        subscriptionId,
        subscriptionStatus: status.toUpperCase(),
        planType: getPlanType(plan.amount.toString()),
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: cancel_at_period_end ?? false,
        isManual: false,
      },
    });

    this.logger.log(
      `✅ Assinatura salva/atualizada para parceiro ${partnerSupplier.tradeName}`,
    );
  }
}
