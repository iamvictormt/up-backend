// Backfill: garante 3 meses de período gratuito para TODOS os lojistas e
// wellness aprovados. Cria assinatura pra quem não tem e reativa quem está
// cancelada/expirada/incompleta. Só NÃO mexe em quem já é pagante real da
// Stripe (assinatura ACTIVE não-manual), pra não rebaixar cliente pagante.
//
// Requer a migração 20260714000000_subscription_wellness aplicada.
// Rodar UMA vez, conferindo antes para onde DATABASE_URL/DIRECT_URL apontam:
//   npx ts-node scripts/backfill-trial-subscriptions.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const trialEnd = new Date();
  trialEnd.setMonth(trialEnd.getMonth() + 3);

  const trialData = {
    subscriptionStatus: 'TRIALING' as const,
    planType: 'TRIAL',
    currentPeriodEnd: trialEnd,
    isManual: true,
  };

  // ponytail: pagante real da Stripe = ACTIVE e não-manual. Esses ficam intocados.
  const isRealPayer = (sub: { subscriptionStatus: string; isManual: boolean } | null) =>
    !!sub && sub.subscriptionStatus === 'ACTIVE' && !sub.isManual;

  const partners = await prisma.partnerSupplier.findMany({
    where: { status: 'APPROVED', isDeleted: false },
    select: { id: true, tradeName: true, subscription: true },
  });
  console.log(`${partners.length} lojistas aprovados.`);

  for (const p of partners) {
    if (isRealPayer(p.subscription)) {
      console.log(`↷ pulado (pagante Stripe): ${p.tradeName}`);
      continue;
    }
    await prisma.subscription.upsert({
      where: { partnerSupplierId: p.id },
      update: trialData,
      create: { partnerSupplierId: p.id, ...trialData },
    });
    console.log(`✅ período gratuito (lojista): ${p.tradeName}`);
  }

  const wellnessList = await prisma.wellness.findMany({
    where: { status: 'APPROVED', isDeleted: false },
    select: { id: true, name: true, subscription: true },
  });
  console.log(`${wellnessList.length} wellness aprovados.`);

  for (const w of wellnessList) {
    if (isRealPayer(w.subscription)) {
      console.log(`↷ pulado (pagante Stripe): ${w.name}`);
      continue;
    }
    await prisma.subscription.upsert({
      where: { wellnessId: w.id },
      update: trialData,
      create: { wellnessId: w.id, ...trialData },
    });
    console.log(`✅ período gratuito (wellness): ${w.name}`);
  }
}

main().finally(() => prisma.$disconnect());
