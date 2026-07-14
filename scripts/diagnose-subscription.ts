// Diagnostica (e opcionalmente conserta) a assinatura de um parceiro por e-mail.
// Uso:
//   npx ts-node scripts/diagnose-subscription.ts <email>          -> só mostra
//   npx ts-node scripts/diagnose-subscription.ts <email> --fix    -> força período gratuito de 3 meses
//
// ⚠️ Confira DATABASE_URL/DIRECT_URL antes de usar --fix.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const fix = process.argv.includes('--fix');

  if (!email) {
    console.error('Uso: npx ts-node scripts/diagnose-subscription.ts <email> [--fix]');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      partnerSupplier: { include: { subscription: true } },
      wellness: { include: { subscription: true } },
    },
  });

  if (!user) {
    console.log(`❌ usuário não encontrado: ${email}`);
    console.log('   (o backfill/reset rodou no mesmo banco? confira o .env)');
    return;
  }

  const partner = user.partnerSupplier;
  const wellness = user.wellness;
  const entity = partner ?? wellness;
  const kind = partner ? 'lojista' : wellness ? 'wellness' : 'nenhum';

  console.log(`e-mail: ${email}`);
  console.log(`tipo:   ${kind}`);
  if (!entity) {
    console.log('⚠️  este usuário não é lojista nem wellness.');
    return;
  }
  console.log(`status cadastro: ${(entity as any).status}`);
  const sub = (entity as any).subscription;
  if (!sub) {
    console.log('assinatura: NENHUMA  → por isso pede plano');
  } else {
    console.log('assinatura:', {
      status: sub.subscriptionStatus,
      planType: sub.planType,
      currentPeriodEnd: sub.currentPeriodEnd,
      isManual: sub.isManual,
    });
    const ok = ['ACTIVE', 'TRIALING'].includes(sub.subscriptionStatus);
    console.log(ok ? '→ status permite acesso' : '→ status NÃO permite acesso (pede plano)');
  }

  if (!fix) {
    console.log('\n(dica: rode de novo com --fix para forçar período gratuito de 3 meses)');
    return;
  }

  const trialEnd = new Date();
  trialEnd.setMonth(trialEnd.getMonth() + 3);
  const owner = partner ? { partnerSupplierId: entity.id } : { wellnessId: entity.id };

  await prisma.subscription.upsert({
    where: owner as any,
    update: {
      subscriptionStatus: 'TRIALING',
      planType: 'TRIAL',
      currentPeriodEnd: trialEnd,
      isManual: true,
    },
    create: {
      ...owner,
      subscriptionStatus: 'TRIALING',
      planType: 'TRIAL',
      currentPeriodEnd: trialEnd,
      isManual: true,
    },
  });
  console.log(`\n✅ período gratuito aplicado até ${trialEnd.toLocaleDateString('pt-BR')}`);
}

main().finally(() => prisma.$disconnect());
