import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EventRegistrationController } from './event-registration.controller';
import { EventRegistrationService } from './event-registration.service';

@Module({
  imports: [PrismaModule],
  controllers: [EventRegistrationController],
  providers: [EventRegistrationService],
})
export class EventRegistrationModule {}
