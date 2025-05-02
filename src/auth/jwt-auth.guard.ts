import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1]; 

    if (!token) {
      throw new UnauthorizedException('Token não fornecido');
    }

    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET_KEY || 'default_secret',
      });
      request.user = decoded;
      return true;
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
