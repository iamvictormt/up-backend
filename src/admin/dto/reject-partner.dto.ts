import { IsNotEmpty, IsString } from 'class-validator';

export class RejectPartnerDto {
  @IsNotEmpty({ message: 'O motivo da rejeição é obrigatório' })
  @IsString()
  reason: string;
}
