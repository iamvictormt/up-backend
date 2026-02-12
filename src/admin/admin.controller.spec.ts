import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminBenefitsService } from './admin-benefit.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { PointsService } from 'src/points/points.service';
import { AdminGuard } from 'src/auth/admin-auth.guard';
import { UserService } from 'src/user/user.service';
import { RejectPartnerDto } from './dto/reject-partner.dto';

describe('AdminController', () => {
  let controller: AdminController;
  let adminService: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: {
            rejectPartnerSupplier: jest.fn(),
          },
        },
        AdminBenefitsService,
        { provide: PrismaService, useValue: {} },
        { provide: MailService, useValue: {} },
        { provide: JwtService, useValue: {} },
        { provide: PointsService, useValue: {} },
        { provide: UserService, useValue: {} },
      ],
    })
    .overrideGuard(AdminGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<AdminController>(AdminController);
    adminService = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call adminService.rejectPartnerSupplier with correct arguments', async () => {
    const id = 'partner-id';
    const dto: RejectPartnerDto = { reason: 'Incomplete documents' };

    await controller.rejectPartnerSupplier(id, dto);

    expect(adminService.rejectPartnerSupplier).toHaveBeenCalledWith(id, dto.reason);
  });
});
