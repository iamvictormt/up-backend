import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller()
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('send-email')
  async sendEmail() {
    await this.mailService.sendMail(
      'victoorres@icloud.com',
      'Teste de e-mail com NestJS',
      'Olá, este é um teste de e-mail enviado via Gmail e NestJS!',
    );
    return 'Email enviado!';
  }
}
