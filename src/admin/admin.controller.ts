import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from 'src/auth/admin-auth.guard';
import { LoginDto } from 'src/auth/dto/login.dto';
import { CreateEventDto } from 'src/event/dto/create-event.dto';
import { DashboardStatistics } from './types/DashboardStatistics';
import { RecentActivity } from './types/RecentActivity';
import { CreateRecommendedProfessionalDto } from 'src/recommended-professional/dto/create-recommended-professional.dto';
import { UpdateRecommendedProfessionalDto } from 'src/recommended-professional/dto/update-recommended-professional.dto';
import { UpdateEventDto } from 'src/event/dto/update-event.dto';
import { RedemptionStatus } from '@prisma/client';
import { UpdateRedemptionStatusDto } from '../benefits/dto/update-redemption-status.dto';
import { UpdateBenefitDto } from '../benefits/dto/update-benefit.dto';
import { CreateBenefitDTO } from '../benefits/dto/create-benefit.dto';
import { AdminBenefitsService } from './admin-benefit.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly adminBenefitsService: AdminBenefitsService,
  ) {}

  @Post('login')
  adminLogin(@Body() loginDto: LoginDto) {
    return this.adminService.adminLogin(loginDto);
  }

  @UseGuards(AdminGuard)
  @Get('partner-suppliers')
  async findAllPartnerSuppliers() {
    return await this.adminService.findAllPartnerSuppliers();
  }

  @UseGuards(AdminGuard)
  @Put('pending/:id')
  async toggleAccessPending(@Param('id') id: string) {
    return await this.adminService.toggleAccessPending(id);
  }

  @UseGuards(AdminGuard)
  @Get('recommended-professionals')
  async findAllRecommendedProfessionals() {
    return await this.adminService.findAllRecommendedProfessionals();
  }

  @Post('recommended-professionals')
  async create(@Body() createDto: CreateRecommendedProfessionalDto) {
    return await this.adminService.createRecommendedProfessional(createDto);
  }

  @Patch('recommended-professionals/:id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateRecommendedProfessionalDto,
  ) {
    return await this.adminService.updateRecommendedProfessional(id, updateDto);
  }

  @Patch('recommended-professionals/toggle-status/:id')
  async inativeProfessional(@Param('id') id: string) {
    return await this.adminService.toggleStatusRecommendedProfessional(id);
  }

  @Delete('recommended-professionals/:id')
  async remove(@Param('id') id: string) {
    return await this.adminService.removeRecommendedProfessional(id);
  }

  @Post('events')
  async createEvent(@Body() data: CreateEventDto) {
    return await this.adminService.createEvent(data);
  }

  @Get('stores')
  async findStores() {
    return await this.adminService.findStores();
  }

  @Get('events')
  async findEvent() {
    return await this.adminService.findEvents();
  }

  @Get('events/:eventId/participants')
  async getEventParticipants(@Param('eventId') eventId: string) {
    return await this.adminService.getEventParticipants(eventId);
  }

  @Patch('events/:id')
  async updateEvent(@Param('id') id: string, @Body() data: UpdateEventDto) {
    return await this.adminService.updateEvent(id, data);
  }

  @Post('events/:eventId/checkin/:professionalId')
  async checkIn(
    @Param('eventId') eventId: string,
    @Param('professionalId') professionalId: string,
  ) {
    return await this.adminService.checkInEvente(eventId, professionalId);
  }

  @Patch('events/:eventId/toggle')
  async toggleEvent(@Param('eventId') eventId: string) {
    return await this.adminService.toggleEvent(eventId);
  }

  @UseGuards(AdminGuard)
  @Get('/dashboard/statistics')
  async getStatistics(): Promise<DashboardStatistics> {
    return await this.adminService.getStatistics();
  }

  @UseGuards(AdminGuard)
  @Get('/dashboard/recent-activities')
  async getRecentActivities(): Promise<RecentActivity[]> {
    return await this.adminService.getRecentActivities();
  }

  /*
  @UseGuards(AdminGuard)
  @Get('events')
  async getAllEvents() {
    return await this.adminService.getAllEvents();
  }

  @UseGuards(AdminGuard)
  @Put('events/:id/approve')
  async approveEvent(@Param('id') id: string) {
    return await this.adminService.approveEvent(id);
  }

  @UseGuards(AdminGuard)
  @Delete('events/:id')
  async deleteEvent(@Param('id') id: string) {
    return await this.adminService.deleteEvent(id);
  }

  /*
  @UseGuards(AdminGuard)
  @Get('benefits')
  async getAllBenefits() {
    return await this.adminService.getAllBenefits();
  }

  @UseGuards(AdminGuard)
  @Put('benefits/:id/toggle')
  async toggleBenefit(@Param('id') id: string) {
    return await this.adminService.toggleBenefit(id);
  }

  @UseGuards(AdminGuard)
  @Delete('benefits/:id')
  async deleteBenefit(@Param('id') id: string) {
    return await this.adminService.deleteBenefit(id);
  }
  */

  @UseGuards(AdminGuard)
  @Get('benefits')
  async getAllBenefits() {
    return this.adminBenefitsService.getAllBenefits();
  }

  @UseGuards(AdminGuard)
  @Get('benefits/:id')
  async getBenefitById(@Param('id') id: string) {
    return this.adminBenefitsService.getBenefitById(id);
  }

  @UseGuards(AdminGuard)
  @Post('benefits')
  async createBenefit(@Body() dto: CreateBenefitDTO) {
    return this.adminBenefitsService.createBenefit(dto);
  }

  @UseGuards(AdminGuard)
  @Put('benefits/:id')
  async updateBenefit(@Param('id') id: string, @Body() dto: UpdateBenefitDto) {
    return this.adminBenefitsService.updateBenefit(id, dto);
  }

  @UseGuards(AdminGuard)
  @Delete('benefits/:id')
  async deleteBenefit(@Param('id') id: string) {
    return this.adminBenefitsService.deleteBenefit(id);
  }

  @UseGuards(AdminGuard)
  @Get('benefits/redemptions/all')
  async getAllRedemptions(
    @Query('status') status?: RedemptionStatus,
    @Query('benefitId') benefitId?: string,
  ) {
    return this.adminBenefitsService.getAllRedemptions({ status, benefitId });
  }

  @UseGuards(AdminGuard)
  @Put('benefits/redemptions/:id/status')
  async updateRedemptionStatus(
    @Param('id') id: string,
    @Body() dto: UpdateRedemptionStatusDto,
  ) {
    return this.adminBenefitsService.updateRedemptionStatus(id, dto.status);
  }
}
