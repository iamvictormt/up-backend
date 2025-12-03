import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BenefitService } from './benefit.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RedeemBenefitDto } from './dto/redeem-benefit.dto';
import { ProfessionalService } from '../professional/professional.service';

@UseGuards(JwtAuthGuard)
@Controller('benefits')
export class BenefitController {
  constructor(
    private readonly benefitsService: BenefitService,
    private readonly professionalService: ProfessionalService,
  ) {}

  @Get('available')
  async getAvailableBenefits(@CurrentUser() user) {
    const professionalId =
      await this.professionalService.findProfessionalIdByUserId(user.sub);
    return this.benefitsService.getAvailableBenefits(professionalId);
  }

  @Get('my-redemptions')
  async getMyRedemptions(@CurrentUser() user) {
    const professionalId =
      await this.professionalService.findProfessionalIdByUserId(user.sub);
    return this.benefitsService.getMyRedemptions(professionalId);
  }

  @Post('redeem')
  async redeemBenefit(
    @CurrentUser() user,
    @Body() dto: RedeemBenefitDto,
  ) {
    const professionalId =
      await this.professionalService.findProfessionalIdByUserId(user.sub);
    return this.benefitsService.redeemBenefit(professionalId, dto);
  }
}
