import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './prisma/prisma.module';
import { PartnerSupplierModule } from './partnerSupplier/partnerSupplier.module';
import { ProfessionalModule } from './professional/professional.module';
import { StoreModule } from './store/store.module';
import { ListedProfessionalModule } from './listed-professional/listed-professional.module';
import { LoveDecorationModule } from './loveDecoration/loveDecoration.module';
import { EventModule } from './event/event.module';
import { EventRegistrationModule } from './eventRegistration/eventRegistration.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.SECRET_KEY || 'default_secret_key',
      signOptions: { expiresIn: '1h' },
    }),
    PartnerSupplierModule,
    ProfessionalModule,
    AuthModule,
    UserModule,
    StoreModule,
    ListedProfessionalModule,
    LoveDecorationModule,
    EventModule,
    EventRegistrationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
