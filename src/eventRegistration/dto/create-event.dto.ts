import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEventRegistrationDto {
  @IsNotEmpty()
  @IsString()
  professionalId: string;

  @IsNotEmpty()
  @IsString()
  eventId: string;
}
