import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from 'src/auth/admin-auth.guard';

@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('partner-suppliers/pending')
  async findAllPartnerSuppliers() {
    return await this.adminService.findAllPartnerSuppliers();
  }

  @Delete('partner-suppliers/:id')
  async DeletePartnerSupplier(@Param('id') id: string) {
    return await this.adminService.findAllPartnerSuppliers();
  }
}
