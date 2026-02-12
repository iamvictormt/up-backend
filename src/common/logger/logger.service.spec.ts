import { LoggerService } from './logger.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('LoggerService', () => {
  let service: LoggerService;
  let prisma: PrismaService;

  beforeEach(() => {
    prisma = {
      errorLog: {
        create: jest.fn().mockResolvedValue({ id: '1' }),
      },
    } as any;
    service = new LoggerService(prisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call prisma.errorLog.create with correct data', async () => {
    const errorData = {
      message: 'Test message',
      stack: 'Test stack',
      statusCode: 400,
      path: '/test',
      method: 'GET',
      context: { body: {} },
    };

    await service.logError(errorData);

    expect(prisma.errorLog.create).toHaveBeenCalledWith({
      data: errorData,
    });
  });

  it('should log to console if prisma fails', async () => {
    const consoleSpy = jest.spyOn((service as any).logger, 'error').mockImplementation();
    (prisma.errorLog.create as jest.Mock).mockRejectedValue(new Error('DB Error'));

    await service.logError({ message: 'Test message' });

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to save error log'), expect.any(String));
    consoleSpy.mockRestore();
  });
});
