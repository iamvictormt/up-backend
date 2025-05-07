import { Controller, Post, Body, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado ou senha inválida');
    }

    if(user.accessPending) {
      throw new ForbiddenException('Cadastro pendente de aprovação. \nVocê receberá um email assim que o processo for concluído.');
    }

    return this.authService.login(user);
  }
}
