import { Test, TestingModule } from '@nestjs/testing';
import { BenefitsController } from './benefits.controller';

describe('BenefitsController', () => {
  let controller: BenefitsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BenefitsController],
    }).compile();

    controller = module.get<BenefitsController>(BenefitsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
