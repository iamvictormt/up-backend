// event-registration.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventRegistrationDto } from './dto/create-event.dto';

@Injectable()
export class EventRegistrationService {
  constructor(private prisma: PrismaService) {}

  register(data: CreateEventRegistrationDto) {
    return this.prisma.eventRegistration.create({
      data,
    });
  }

  findAll() {
    return this.prisma.eventRegistration.findMany({
      include: { professional: true, event: true },
    });
  }

  findByEvent(eventId: string) {
    return this.prisma.eventRegistration.findMany({
      where: { eventId },
      include: { professional: true },
    });
  }
}
