import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { EventService } from './event.service';
import { RegisterProfessionalDto } from './dto/register-professional.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

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

  @Get('me')
  async getCurrentUserEvents(@CurrentUser('sub') userId: string) {
    return this.eventService.findUserEvents(userId);
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
