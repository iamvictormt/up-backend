import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSubscriptionStatusByPartner(partnerSupplierId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { partnerSupplierId },
    });

    if (!subscription) return 'INEXISTENTE';

    const isExpired = new Date(subscription.currentPeriodEnd) < new Date();

    if (subscription.subscriptionStatus === 'CANCELED' && !isExpired) {
      return 'CANCELADO_POREM_ATIVO';
    }

    if (!isExpired) {
      return 'ATIVO';
    }

    return 'INEXISTENTE';
  }
}
