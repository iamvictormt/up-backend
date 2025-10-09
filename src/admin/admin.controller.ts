import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
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

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
  @Get('recommended-professionals')
  async getRecommendedProfessionals() {
    return await this.adminService.getRecommendedProfessionals();
  }

  @UseGuards(AdminGuard)
  @Put('recommended-professionals/:id/toggle')
  async toggleRecommendedProfessional(@Param('id') id: string) {
    return await this.adminService.toggleRecommendedProfessional(id);
  }

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
}
