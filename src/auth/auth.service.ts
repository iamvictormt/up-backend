import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        partnerSupplier: true,
        professional: true,
        loveDecoration: true,
        address: true,
      },
    });

    if (!user) {
      return null;
    }

    if (user.partnerSupplier && user.partnerSupplier.accessPending) {
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
        : 'loveDecoration';

    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.SECRET_KEY || 'default_secret',
        expiresIn: '10m',
      }),
      user: safeUser,
      role: role,
    };
  }
}
