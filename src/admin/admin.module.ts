import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { MailModule } from 'src/mail/mail.module';
import { PointsModule } from 'src/points/points.module';
import { AdminBenefitsService } from './admin-benefit.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, AdminBenefitsService],
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.SECRET_KEY || 'default_secret',
      signOptions: { expiresIn: '100h' },
    }),
    UserModule,
    AuthModule,
    MailModule,
    PointsModule,
  ],
})
export class AdminModule {}
