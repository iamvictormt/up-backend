// Reseta a senha de contas de teste para um valor conhecido.
// Uso:
//   npx ts-node scripts/reset-test-password.ts <novaSenha> <email1> [email2] [email3...]
// Ex.:
//   npx ts-node scripts/reset-test-password.ts senha123 lojista@teste.com wellness@teste.com prof@teste.com
//
// ⚠️ Confira para onde DATABASE_URL/DIRECT_URL apontam antes de rodar.
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const [newPassword, ...emails] = process.argv.slice(2);

  if (!newPassword || emails.length === 0) {
    console.error(
      'Uso: npx ts-node scripts/reset-test-password.ts <novaSenha> <email1> [email2...]',
    );
    process.exit(1);
  }

  const hashed = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));

  for (const email of emails) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.warn(`⚠️  não encontrado: ${email}`);
      continue;
    }
    await prisma.user.update({
      where: { email },
      data: { password: hashed },
    });
    console.log(`✅ senha redefinida: ${email}  →  "${newPassword}"`);
  }
}

main().finally(() => prisma.$disconnect());
