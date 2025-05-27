import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CreateEventRegistrationDto } from './dto/create-event.dto';
import { EventRegistrationService } from './event-registration.service';

@Controller('event-registrations')
export class EventRegistrationController {
  constructor(private readonly eventRegistrationService: EventRegistrationService) {}

  @Post()
  register(@Body() data: CreateEventRegistrationDto) {
    return this.eventRegistrationService.register(data);
  }

  @Get()
  findAll() {
    return this.eventRegistrationService.findAll();
  }

  @Get('event/:eventId')
  findByEvent(@Param('eventId') eventId: string) {
    return this.eventRegistrationService.findByEvent(eventId);
  }
}
