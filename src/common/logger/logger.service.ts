import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LoggerService {
  private readonly logger = new Logger(LoggerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async logError(data: {
    message: string;
    stack?: string;
    statusCode?: number;
    path?: string;
    method?: string;
    context?: any;
  }) {
    try {
      await this.prisma.errorLog.create({
        data: {
          message: data.message,
          stack: data.stack,
          statusCode: data.statusCode,
          path: data.path,
          method: data.method,
          context: data.context,
        },
      });
    } catch (error) {
      this.logger.error('Failed to save error log to database', error.stack);
      // Fallback to standard console logging if database logging fails
      this.logger.error(`Original Error: ${data.message}`, data.stack);
    }
  }
}
