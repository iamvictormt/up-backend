import {
  Controller,
  Post,
  Body,
  BadRequestException,
  NotFoundException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
@UseGuards(ThrottlerGuard)
// ponytail: ValidationPipe local — global exigiria revisar todos os controllers.
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado ou senha inválida');
    }

    return this.authService.login(user);
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 300_000 } })
  requestReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestReset(dto);
  }

  @Post('verify-reset-code')
  @Throttle({ default: { limit: 5, ttl: 300_000 } })
  verifyCode(@Body() dto: VerifyResetCodeDto) {
    return this.authService.verifyCode(dto);
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 300_000 } })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const success = await this.authService.resetPassword(dto);

    if (!success) {
      throw new BadRequestException('Código inválido ou expirado');
    }

    return { message: 'Senha redefinida com sucesso' };
  }
}
