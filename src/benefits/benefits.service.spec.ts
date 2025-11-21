import { Test, TestingModule } from '@nestjs/testing';
import { BenefitsService } from './benefits.service';

describe('BenefitsService', () => {
  let service: BenefitsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BenefitsService],
    }).compile();

    service = module.get<BenefitsService>(BenefitsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
