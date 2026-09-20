import { AuthService } from './auth.service';

// ponytail: prisma falso só com o que resetPassword toca — sem TestingModule, sem banco.
const makePrisma = () => {
  const users = [
    { id: 'vitima', email: 'vitima@up.com', isDeleted: false },
    { id: 'atacante', email: 'atacante@up.com', isDeleted: false },
  ];
  const codes = [
    {
      id: 'c1',
      code: '12345',
      userId: 'atacante',
      used: false,
      expiresAt: new Date(Date.now() + 60_000),
    },
  ];

  return {
    updated: [] as any[],
    mailsSent: [] as string[],
    codesCreated: [] as any[],
    user: {
      findUnique: ({ where }: any) =>
        Promise.resolve(users.find((u) => u.email === where.email) ?? null),
      update: ({ where, data }: any) => {
        prisma.updated.push(where);
        return Promise.resolve({ ...where, ...data });
      },
    },
    passwordResetCode: {
      findFirst: ({ where }: any) =>
        Promise.resolve(
          codes.find(
            (c) =>
              c.userId === where.userId &&
              (where.code === undefined || c.code === where.code) &&
              c.used === where.used &&
              c.expiresAt > where.expiresAt.gt,
          ) ?? null,
        ),
      update: () => Promise.resolve({}),
      create: ({ data }: any) => {
        prisma.codesCreated.push(data);
        return Promise.resolve(data);
      },
    },
  };
};

const mail = {
  sendMail: (to: string) => {
    prisma.mailsSent.push(to);
    return Promise.resolve();
  },
};

let prisma: ReturnType<typeof makePrisma>;
let service: AuthService;

beforeEach(() => {
  prisma = makePrisma();
  service = new AuthService({} as any, prisma as any, mail as any);
});

describe('resetPassword', () => {
  it('não troca a senha de outro usuário com um código válido alheio', async () => {
    const ok = await service.resetPassword({
      email: 'vitima@up.com',
      code: '12345', // código emitido para o atacante
      newPassword: 'senhaDoAtacante1',
    });

    expect(ok).toBe(false);
    expect(prisma.updated).toHaveLength(0);
  });

  it('troca a senha do dono do código', async () => {
    const ok = await service.resetPassword({
      email: 'atacante@up.com',
      code: '12345',
      newPassword: 'novaSenha123',
    });

    expect(ok).toBe(true);
    expect(prisma.updated).toEqual([{ id: 'atacante' }]);
  });
});

describe('requestReset', () => {
  const NEUTRO = 'Se este e-mail estiver cadastrado, você receberá um código.';

  it('responde igual para e-mail inexistente, sem vazar quem é cadastrado', async () => {
    const r = await service.requestReset({ email: 'ninguem@up.com' });

    expect(r.message).toBe(NEUTRO);
    expect(prisma.mailsSent).toHaveLength(0);
  });

  it('responde a mesma coisa para e-mail existente', async () => {
    const r = await service.requestReset({ email: 'vitima@up.com' });

    expect(r.message).toBe(NEUTRO);
    expect(prisma.mailsSent).toEqual(['vitima@up.com']);
  });

  it('reenvia o código válido existente em vez de criar outro', async () => {
    const r = await service.requestReset({ email: 'atacante@up.com' });

    expect(r.message).toBe(NEUTRO);
    expect(prisma.codesCreated).toHaveLength(0);
    expect(prisma.mailsSent).toEqual(['atacante@up.com']);
  });
});
