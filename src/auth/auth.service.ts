import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { MailService } from '../mail/mail.service';
import { getUsername } from '../ultis';
import { ResetPasswordDto } from './dto/reset-password.dto';

const RESET_REQUEST_RESPONSE = {
  message: 'Se este e-mail estiver cadastrado, você receberá um código.',
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
        isDeleted: false,
      },
      include: {
        partnerSupplier: {
          include: { subscription: true },
        },
        professional: {
          include: { profession: true },
        },
        loveDecoration: true,
        wellness: true,
        address: true,
      },
    });

    if (!user) {
      return null;
    }

    // wellness precisa ser aceito, mas não tem plano
    if (user.partnerSupplier?.status === 'PENDING' || user.wellness?.status === 'PENDING') {
      throw new ForbiddenException(
        'Cadastro pendente de aprovação. \nVocê receberá um email assim que o processo for concluído.',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
    };

    const { password, ...safeUser } = user;
    const role = user.professionalId
      ? 'professional'
      : user.partnerSupplierId
        ? 'partnerSupplier'
        : user.wellnessId
          ? 'wellness'
          : 'loveDecoration';

    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.SECRET_KEY || 'default_secret',
        expiresIn: '12h',
      }),
      user: safeUser,
      role: role,
    };
  }

  async requestReset(dto: RequestPasswordResetDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        professional: true,
        loveDecoration: true,
        partnerSupplier: true,
      },
    });

    // Resposta idêntica exista ou não a conta: senão o endpoint vira um
    // verificador de quem é cadastrado na plataforma.
    if (!user) return RESET_REQUEST_RESPONSE;

    const existing = await this.prisma.passwordResetCode.findFirst({
      where: {
        userId: user.id,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    // Reenvia o código ainda válido em vez de emitir outro, para a resposta
    // neutra continuar verdadeira (o e-mail sai de qualquer jeito).
    // ponytail: 5 dígitos (90k) porque o template do e-mail tem 5 caixas fixas;
    // com o throttle de /auth isso basta. Subir para 6 = editar reset-code.html.
    const code = existing?.code ?? randomInt(10000, 100000).toString();

    if (!existing) {
      await this.prisma.passwordResetCode.create({
        data: {
          code,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
          userId: user.id,
        },
      });
    }

    await this.mailService.sendMail(
      user.email,
      'Código de recuperação de senha',
      'reset-code.html',
      {
        username: getUsername(user),
        c1: code[0],
        c2: code[1],
        c3: code[2],
        c4: code[3],
        c5: code[4],
      },
    );

    return RESET_REQUEST_RESPONSE;
  }

  async verifyCode(dto: VerifyResetCodeDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new BadRequestException('Código inválido ou expirado.');

    const match = await this.prisma.passwordResetCode.findFirst({
      where: {
        userId: user.id,
        code: dto.code,
        used: false,
        expiresAt: { gte: new Date() },
      },
    });

    if (!match) throw new BadRequestException('Código inválido ou expirado.');

    return { message: 'Código validado com sucesso.' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<boolean> {
    const { email, code, newPassword } = dto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.isDeleted) return false;

    const stored = await this.prisma.passwordResetCode.findFirst({
      where: {
        userId: user.id,
        code: code,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!stored) return false;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await this.prisma.passwordResetCode.update({
      where: { id: stored.id },
      data: { used: true },
    });

    return true;
  }
}
