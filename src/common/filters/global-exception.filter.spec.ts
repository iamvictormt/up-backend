import { GlobalExceptionFilter } from './global-exception.filter';
import { LoggerService } from '../logger/logger.service';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let loggerService: LoggerService;

  beforeEach(() => {
    loggerService = {
      logError: jest.fn().mockResolvedValue(undefined),
    } as any;
    filter = new GlobalExceptionFilter(loggerService);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should log error and return response', async () => {
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const mockRequest = {
      url: '/test',
      method: 'GET',
      body: {},
      query: {},
      params: {},
      headers: {},
    };
    const mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnThis(),
      getResponse: jest.fn().mockReturnValue(mockResponse),
      getRequest: jest.fn().mockReturnValue(mockRequest),
    } as unknown as ArgumentsHost;

    const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

    await filter.catch(exception, mockArgumentsHost);

    expect(loggerService.logError).toHaveBeenCalled();
    const callData = (loggerService.logError as jest.Mock).mock.calls[0][0];
    expect(callData.message).toBe('Test error');
    expect(callData.statusCode).toBe(400);
    expect(callData.path).toBe('/test');

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 400,
      message: 'Test error',
    }));
  });

  it('should handle generic errors', async () => {
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    const mockRequest = {
      url: '/fatal',
      method: 'POST',
      body: { data: 'some data' },
      query: {},
      params: {},
      headers: {},
    };
    const mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnThis(),
      getResponse: jest.fn().mockReturnValue(mockResponse),
      getRequest: jest.fn().mockReturnValue(mockRequest),
    } as unknown as ArgumentsHost;

    const exception = new Error('Fatal crash');

    await filter.catch(exception, mockArgumentsHost);

    expect(loggerService.logError).toHaveBeenCalled();
    const callData = (loggerService.logError as jest.Mock).mock.calls[0][0];
    expect(callData.message).toBe('Fatal crash');
    expect(callData.statusCode).toBe(500);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
