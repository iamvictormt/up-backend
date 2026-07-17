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
import { RejectPartnerDto } from './dto/reject-partner.dto';
import { UpdateWellnessDto } from 'src/wellness/dto/update-wellness.dto';
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
import { GrantTrialDto } from './dto/grant-trial.dto';
import { FindAllProfessionalsDto } from './dto/find-all-professionals.dto';
import { UpdatePointsLimitDto } from './dto/update-points-limit.dto';
import { UpdateProfessionalDto } from 'src/professional/dto/update-professional.dto';
import { UpdatePartnerSupplierDto } from 'src/partner-supplier/dto/update-partner-supplier.dto';
import { CreateStoreDto } from 'src/store/dto/create-store.dto';
import { UpdateStoreDto } from 'src/store/dto/update-store.dto';
import { CreateProductDto } from 'src/product/dto/create-product.dto';
import { UpdateProductDto } from 'src/product/dto/update-product.dto';
import { CreateProfessionDto } from 'src/profession/dto/create-profession.dto';
import { UpdateProfessionDto } from 'src/profession/dto/update-profession.dto';
import { CreateStoreCategoryDto } from 'src/store-category/dto/create-store-category.dto';
import { UpdateStoreCategoryDto } from 'src/store-category/dto/update-store-category.dto';
import { CreateWellnessCategoryDto } from 'src/wellness-category/dto/create-wellness-category.dto';
import { UpdateWellnessCategoryDto } from 'src/wellness-category/dto/update-wellness-category.dto';
import { CreateCommunityDto } from 'src/community/dto/create-community.dto';
import { UpdateCommunityDto } from 'src/community/dto/update-community.dto';
import { CreatePostDTO } from 'src/post/dto/create-post.dto';
import { UpdatePostDto } from 'src/post/dto/update-post.dto';
import { CreateReportDto } from 'src/report/dto/create-report.dto';

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
  @Get('professionals')
  findAllProfessionals(@Query() dto: FindAllProfessionalsDto) {
    return this.adminService.findAllProfessionals(dto);
  }

  @UseGuards(AdminGuard)
  @Patch('professionals/:id')
  updateProfessional(
    @Param('id') id: string,
    @Body() dto: UpdateProfessionalDto,
  ) {
    return this.adminService.updateProfessional(id, dto);
  }

  @UseGuards(AdminGuard)
  @Get('professions')
  findAllProfessions() {
    return this.adminService.findAllProfessions();
  }

  @UseGuards(AdminGuard)
  @Post('professions')
  createProfession(@Body() dto: CreateProfessionDto) {
    return this.adminService.createProfession(dto);
  }

  @UseGuards(AdminGuard)
  @Patch('professions/:id')
  updateProfession(
    @Param('id') id: string,
    @Body() dto: UpdateProfessionDto,
  ) {
    return this.adminService.updateProfession(id, dto);
  }

  @UseGuards(AdminGuard)
  @Delete('professions/:id')
  deleteProfession(@Param('id') id: string) {
    return this.adminService.deleteProfession(id);
  }

  @UseGuards(AdminGuard)
  @Get('store-categories')
  findAllStoreCategories() {
    return this.adminService.findAllStoreCategories();
  }

  @UseGuards(AdminGuard)
  @Post('store-categories')
  createStoreCategory(@Body() dto: CreateStoreCategoryDto) {
    return this.adminService.createStoreCategory(dto);
  }

  @UseGuards(AdminGuard)
  @Patch('store-categories/:id')
  updateStoreCategory(
    @Param('id') id: string,
    @Body() dto: UpdateStoreCategoryDto,
  ) {
    return this.adminService.updateStoreCategory(id, dto);
  }

  @UseGuards(AdminGuard)
  @Delete('store-categories/:id')
  deleteStoreCategory(@Param('id') id: string) {
    return this.adminService.deleteStoreCategory(id);
  }

  @UseGuards(AdminGuard)
  @Get('wellness-categories')
  findAllWellnessCategories() {
    return this.adminService.findAllWellnessCategories();
  }

  @UseGuards(AdminGuard)
  @Post('wellness-categories')
  createWellnessCategory(@Body() dto: CreateWellnessCategoryDto) {
    return this.adminService.createWellnessCategory(dto);
  }

  @UseGuards(AdminGuard)
  @Patch('wellness-categories/:id')
  updateWellnessCategory(
    @Param('id') id: string,
    @Body() dto: UpdateWellnessCategoryDto,
  ) {
    return this.adminService.updateWellnessCategory(id, dto);
  }

  @UseGuards(AdminGuard)
  @Delete('wellness-categories/:id')
  deleteWellnessCategory(@Param('id') id: string) {
    return this.adminService.deleteWellnessCategory(id);
  }

  @UseGuards(AdminGuard)
  @Get('communities')
  findAllCommunities() {
    return this.adminService.findAllCommunities();
  }

  @UseGuards(AdminGuard)
  @Post('communities')
  createCommunity(@Body() dto: CreateCommunityDto) {
    return this.adminService.createCommunity(dto);
  }

  @UseGuards(AdminGuard)
  @Patch('communities/:id')
  updateCommunity(
    @Param('id') id: string,
    @Body() dto: UpdateCommunityDto,
  ) {
    return this.adminService.updateCommunity(id, dto);
  }

  @UseGuards(AdminGuard)
  @Delete('communities/:id')
  deleteCommunity(@Param('id') id: string) {
    return this.adminService.deleteCommunity(id);
  }

  @UseGuards(AdminGuard)
  @Get('post-authors')
  findPostAuthors() {
    return this.adminService.findPostAuthors();
  }

  @UseGuards(AdminGuard)
  @Get('posts')
  findAllPosts() {
    return this.adminService.findAllPosts();
  }

  @UseGuards(AdminGuard)
  @Post('posts')
  createPost(@Body() dto: CreatePostDTO) {
    return this.adminService.createPost(dto);
  }

  @UseGuards(AdminGuard)
  @Patch('posts/:id')
  updatePost(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.adminService.updatePost(id, dto);
  }

  @UseGuards(AdminGuard)
  @Delete('posts/:id')
  deletePost(@Param('id') id: string) {
    return this.adminService.deletePost(id);
  }

  @UseGuards(AdminGuard)
  @Get('reports')
  findAllReports() {
    return this.adminService.findAllReports();
  }

  @UseGuards(AdminGuard)
  @Post('reports')
  createReport(@Body() dto: CreateReportDto) {
    return this.adminService.createReport(dto);
  }

  @UseGuards(AdminGuard)
  @Patch('reports/:id')
  updateReport(@Param('id') id: string, @Body() dto: Partial<CreateReportDto>) {
    return this.adminService.updateReport(id, dto);
  }

  @UseGuards(AdminGuard)
  @Delete('reports/:id')
  deleteReport(@Param('id') id: string) {
    return this.adminService.deleteReport(id);
  }

  @UseGuards(AdminGuard)
  @Patch('professionals/:id/toggle-verification')
  toggleProfessionalVerification(@Param('id') id: string) {
    return this.adminService.toggleProfessionalVerification(id);
  }

  @UseGuards(AdminGuard)
  @Delete('professionals/:id')
  softDeleteProfessional(@Param('id') id: string) {
    return this.adminService.softDeleteProfessional(id);
  }

  @UseGuards(AdminGuard)
  @Get('partner-suppliers')
  async findAllPartnerSuppliers() {
    return await this.adminService.findAllPartnerSuppliers();
  }

  @UseGuards(AdminGuard)
  @Patch('partner-suppliers/:id')
  async updatePartnerSupplier(
    @Param('id') id: string,
    @Body() dto: UpdatePartnerSupplierDto,
  ) {
    return await this.adminService.updatePartnerSupplier(id, dto);
  }

  @UseGuards(AdminGuard)
  @Post('stores')
  async createStore(@Body() dto: CreateStoreDto) {
    return await this.adminService.createStore(dto);
  }

  @UseGuards(AdminGuard)
  @Patch('stores/:id')
  async updateStore(@Param('id') id: string, @Body() dto: UpdateStoreDto) {
    return await this.adminService.updateStore(id, dto);
  }

  @UseGuards(AdminGuard)
  @Post('stores/:storeId/products')
  async createProduct(
    @Param('storeId') storeId: string,
    @Body() dto: CreateProductDto,
  ) {
    return await this.adminService.createStoreProduct(storeId, dto);
  }

  @UseGuards(AdminGuard)
  @Patch('products/:id')
  async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return await this.adminService.updateStoreProduct(id, dto);
  }

  @UseGuards(AdminGuard)
  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string) {
    return await this.adminService.deleteStoreProduct(id);
  }

  @UseGuards(AdminGuard)
  @Get('physical-sales')
  async findAllPhysicalSales() {
    return await this.adminService.findAllPhysicalSales();
  }

  @UseGuards(AdminGuard)
  @Patch('partner-suppliers/:id/points-limit')
  async updatePartnerPointsLimit(
    @Param('id') id: string,
    @Body() dto: UpdatePointsLimitDto,
  ) {
    return await this.adminService.updatePartnerPointsLimit(id, dto.pointsLimit);
  }

  @UseGuards(AdminGuard)
  @Patch('approve-partner/:id')
  async approvePartnerSupplier(@Param('id') id: string) {
    return await this.adminService.approvePartnerSupplier(id);
  }

  @UseGuards(AdminGuard)
  @Patch('partner-suppliers/:id/toggle-verification')
  async togglePartnerVerification(@Param('id') id: string) {
    return await this.adminService.togglePartnerVerification(id);
  }

  @UseGuards(AdminGuard)
  @Patch('reject-partner/:id')
  async rejectPartnerSupplier(
    @Param('id') id: string,
    @Body() dto: RejectPartnerDto,
  ) {
    return await this.adminService.rejectPartnerSupplier(id, dto.reason);
  }

  @UseGuards(AdminGuard)
  @Get('wellness')
  async findAllWellness() {
    return await this.adminService.findAllWellness();
  }

  @UseGuards(AdminGuard)
  @Patch('wellness/:id/approve')
  async approveWellness(@Param('id') id: string) {
    return await this.adminService.approveWellness(id);
  }

  @UseGuards(AdminGuard)
  @Patch('wellness/:id/reject')
  async rejectWellness(@Param('id') id: string, @Body() dto: RejectPartnerDto) {
    return await this.adminService.rejectWellness(id, dto.reason);
  }

  @UseGuards(AdminGuard)
  @Patch('wellness/:id')
  async updateWellness(
    @Param('id') id: string,
    @Body() dto: UpdateWellnessDto,
  ) {
    return await this.adminService.updateWellness(id, dto);
  }

  @UseGuards(AdminGuard)
  @Delete('wellness/:id')
  async softDeleteWellness(@Param('id') id: string) {
    return await this.adminService.softDeleteWellness(id);
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
  @Delete('events/:eventId')
  async deleteEvent(@Param('eventId') eventId: string) {
    return await this.adminService.deleteEvent(eventId);
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

  @Patch('benefits/:id/toggle')
  async toggleBenefit(@Param('id') benefitId: string) {
    return await this.adminBenefitsService.toggleBenefitStatus(benefitId);
  }

  @UseGuards(AdminGuard)
  @Patch('grant-trial/:id')
  async grantTrial(@Param('id') id: string, @Body() dto: GrantTrialDto) {
    return await this.adminService.grantTrial(id, dto);
  }

  @UseGuards(AdminGuard)
  @Patch('cancel-trial/:id')
  async cancelTrial(@Param('id') id: string) {
    return await this.adminService.cancelManualSubscription(id);
  }

  @UseGuards(AdminGuard)
  @Patch('subscription/:id/edit')
  async editSubscription(
    @Param('id') id: string,
    @Body() dto: { planType?: string; currentPeriodEnd?: string },
  ) {
    return await this.adminService.editSubscription(id, dto);
  }

  @UseGuards(AdminGuard)
  @Patch('subscription/:id/extend')
  async extendSubscription(
    @Param('id') id: string,
    @Body() dto: { months: number },
  ) {
    return await this.adminService.extendSubscription(id, dto);
  }

  @UseGuards(AdminGuard)
  @Get('subscription/:id/history')
  async getSubscriptionHistory(@Param('id') id: string) {
    return await this.adminService.getSubscriptionHistory(id);
  }

  @UseGuards(AdminGuard)
  @Delete('partner-supplier/:id')
  async softDeletePartnerSupplier(@Param('id') id: string) {
    return await this.adminService.softDeletePartnerSupplier(id);
  }
}
