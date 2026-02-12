import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { MailService } from '../mail/mail.service';
import { getUsername } from '../ultis';
import { ResetPasswordDto } from './dto/reset-password.dto';

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
        partnerSupplier: true,
        professional: {
          include: { profession: true },
        },
        loveDecoration: true,
        address: true,
      },
    });

    if (!user) {
      return null;
    }

    if (user.partnerSupplier) {
      if (user.partnerSupplier.status === 'PENDING') {
        throw new ForbiddenException(
          'Cadastro pendente de aprovação. \nVocê receberá um email assim que o processo for concluído.',
        );
      }
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

    if (!user) throw new NotFoundException('Usuário não encontrado.');

    const existing = await this.prisma.passwordResetCode.findFirst({
      where: {
        userId: user.id,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (existing) {
      return {
        message: 'Já foi enviado um código válido. Aguarde até expirar.',
      };
    }

    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.passwordResetCode.create({
      data: {
        code,
        expiresAt,
        userId: user.id,
      },
    });

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

    return { message: 'Código de recuperação enviado por e-mail.' };
  }

  async verifyCode(dto: VerifyResetCodeDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado.');

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
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const stored = await this.prisma.passwordResetCode.findFirst({
      where: {
        code: code,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!stored) return false;

    await this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    await this.prisma.passwordResetCode.update({
      where: { id: stored.id },
      data: { used: true },
    });

    return true;
  }
}
