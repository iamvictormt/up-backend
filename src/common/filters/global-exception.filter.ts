import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../logger/logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly loggerService: LoggerService) {}

  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: exception.message || 'Internal server error' };

    const message =
      typeof exceptionResponse === 'object'
        ? (exceptionResponse as any).message || JSON.stringify(exceptionResponse)
        : exceptionResponse;

    // Prepare context for logging, redacting sensitive information
    const context = {
      body: { ...request.body },
      query: request.query,
      params: request.params,
      headers: { ...request.headers },
      user: request['user'] ? { id: request['user'].id, email: request['user'].email } : null,
    };

    // Redact sensitive fields
    if (context.body.password) context.body.password = '***';
    if (context.headers.authorization) context.headers.authorization = '***';

    const errorLog = {
      message: message,
      stack: exception.stack,
      statusCode: status,
      path: request.url,
      method: request.method,
      context,
    };

    // Also log to console for immediate visibility during development
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception.stack,
    );

    // Save to database asynchronously (don't block the response if possible,
    // but here we wait to ensure it's logged)
    await this.loggerService.logError(errorLog);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}
