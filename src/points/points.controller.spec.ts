import { Test, TestingModule } from '@nestjs/testing';
import { PointsController } from './points.controller';
import { PointsService } from './points.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

describe('PointsController', () => {
  let controller: PointsController;
  let pointsService: PointsService;

  const mockPointsService = {
    getHistoryByUserEmail: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PointsController],
      providers: [
        { provide: PointsService, useValue: mockPointsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<PointsController>(PointsController);
    pointsService = module.get<PointsService>(PointsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHistory', () => {
    it('should call getHistoryByUserEmail with the user email', async () => {
      const mockUser = { email: 'test@example.com' };
      const mockHistory = [
        { id: '1', value: 10, operation: 'ADD', source: 'TEST', createdAt: new Date() },
      ];

      (pointsService.getHistoryByUserEmail as jest.Mock).mockResolvedValue(mockHistory);

      const result = await controller.getHistory(mockUser, 20);

      expect(pointsService.getHistoryByUserEmail).toHaveBeenCalledWith('test@example.com', 20);
      expect(result).toEqual(mockHistory);
    });
  });
});
