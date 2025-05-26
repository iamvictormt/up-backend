import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EventService } from './event.service';
import { UserModule } from '../user/user.module';
import { EventController } from './event.controller';

@Module({
  imports: [UserModule, PrismaModule],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
