import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { EventService } from './event.service';
import { RegisterProfessionalDto } from './dto/register-professional.dto';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post(':eventId/registrations')
  async register(
    @Param('eventId') eventId: string,
    @Body() data: RegisterProfessionalDto,
  ) {
    return await this.eventService.registerProfessional(eventId, data);
  }

  @Get()
  findAll() {
    return this.eventService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(id);
  }

  /*
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateEventDto) {
    return this.eventService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventService.remove(id);
  }
  */
}
