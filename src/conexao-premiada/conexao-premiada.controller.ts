import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
  Patch,
  Param,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ConexaoPremiadaService } from './conexao-premiada.service';
import { RegisterSaleDto } from './dto/register-sale.dto';
import { RedeemCodeDto } from './dto/redeem-code.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';

// A app não tem ValidationPipe global, então os DTOs deste módulo são validados aqui
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@UseGuards(JwtAuthGuard)
@Controller('conexao-premiada')
export class ConexaoPremiadaController {
  constructor(private readonly conexaoPremiadaService: ConexaoPremiadaService) {}

  @Post('register-sale')
  async registerSale(
    @CurrentUser() user: any,
    @Body() dto: RegisterSaleDto,
  ) {
    return this.conexaoPremiadaService.registerSale(user.sub, dto);
  }

  @Post('redeem-code')
  async redeemCode(
    @CurrentUser() user: any,
    @Body() dto: RedeemCodeDto,
  ) {
    return this.conexaoPremiadaService.redeemCode(user.sub, dto);
  }

  @Get('search-professional')
  async searchProfessional(
    @CurrentUser() user: any,
    @Query('q') q: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
  ) {
    return this.conexaoPremiadaService.searchProfessionals(user.sub, q, page);
  }

  @Patch('sales/:id')
  async updateSale(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateSaleDto,
  ) {
    return this.conexaoPremiadaService.updateSaleAsPartner(user.sub, id, dto);
  }

  @Patch('sales/:id/cancel')
  async cancelSale(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.conexaoPremiadaService.cancelSaleAsPartner(user.sub, id);
  }

  @Get('my-purchases')
  async myPurchases(@CurrentUser() user: any) {
    return this.conexaoPremiadaService.findMyPurchases(user.sub);
  }

  @Get('get-all-sales')
  async getAllSales(
    @CurrentUser() user: any,
  ) {
    return this.conexaoPremiadaService.findAllPhysicalSales(user.sub);
  }
}
