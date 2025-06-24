import {
  Controller,
  Post,
  Body,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado ou senha inválida');
    }

    return this.authService.login(user);
  }

  @Post('forgot-password')
  requestReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestReset(dto);
  }

  @Post('verify-reset-code')
  verifyCode(@Body() dto: VerifyResetCodeDto) {
    return this.authService.verifyCode(dto);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const success = await this.authService.resetPassword(dto);

    if (!success) {
      throw new BadRequestException('Código inválido ou expirado');
    }

    return { message: 'Senha redefinida com sucesso' };
  }
}
