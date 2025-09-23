import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ADMIN_EMAIL } from 'src/admin/constant/admin-datas';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token não fornecido');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = this.jwtService.verify(token);

      // console.log('decoded', JSON.stringify(decoded));

      const userId = decoded.sub;
      const userRole = decoded.role;

      if (!userId) {
        throw new UnauthorizedException(
          'Token inválido: ID do usuário ausente',
        );
      }

      // Verificar se é o admin direto (do login de admin)
      if (
        userId === 'admin' &&
        userRole === 'admin' &&
        decoded.email === 'admin@upconnection.app'
      ) {
        return true;
      }

      // Verificar se é um usuário normal com email de admin
      const user = await this.userService.findOne(userId);

      if (!user || user.email !== ADMIN_EMAIL) {
        throw new ForbiddenException(
          'Acesso permitido apenas para administradores',
        );
      }

      return true;
    } catch (error: any) {
      console.error('error', error);
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
