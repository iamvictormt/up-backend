import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EventRegistrationController } from './eventRegistration.controller';
import { EventRegistrationService } from './eventRegistration.service';

@Module({
  imports: [PrismaModule],
  controllers: [EventRegistrationController],
  providers: [EventRegistrationService],
})
export class EventRegistrationModule {}
