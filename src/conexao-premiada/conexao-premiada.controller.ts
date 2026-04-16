import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ConexaoPremiadaService } from './conexao-premiada.service';
import { RegisterSaleDto } from './dto/register-sale.dto';
import { RedeemCodeDto } from './dto/redeem-code.dto';

@UseGuards(JwtAuthGuard)
@Controller('conexao-premiada')
export class ConexaoPremiadaController {
  constructor(private readonly conexaoPremiadaService: ConexaoPremiadaService) {}

  @Post('register-sale')
  async registerSale(
    @CurrentUser() user: any,
    @Body() dto: RegisterSaleDto,
  ) {
    return this.conexaoPremiadaService.registerSale(user.userId || user.id, dto);
  }

  @Post('redeem-code')
  async redeemCode(
    @CurrentUser() user: any,
    @Body() dto: RedeemCodeDto,
  ) {
    console.log('user', user);
    console.log('dto', dto);
    return this.conexaoPremiadaService.redeemCode(user.userId || user.id, dto);
  }
}
