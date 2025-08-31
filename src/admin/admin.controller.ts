import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from 'src/auth/admin-auth.guard';

@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('partner-supplierS/pending')
  async findOne() {
    return await this.adminService.findAllPartnerSuppliers();
  }
}
