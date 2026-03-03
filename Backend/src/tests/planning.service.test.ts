import { PlanningService } from '../services/planning.service';
import { PlanningRepository } from '../repositories/planning.repository';
import { AppError } from '../middleware/error.middleware';

jest.mock('../repositories/planning.repository');

describe('PlanningService', () => {
  let planningService: PlanningService;
  let planningRepository: jest.Mocked<PlanningRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    planningRepository = new PlanningRepository() as jest.Mocked<PlanningRepository>;
    planningService = new PlanningService();
    (planningService as any).planningRepository = planningRepository;
  });

  describe('createWeeklyPlan', () => {
    const validData = {
      clientPercentage: 50,
      techDebtPercentage: 30,
      rndPercentage: 20,
      startDate: new Date(),
      endDate: new Date()
    };

    it('should create a plan with correct allocations if percentages total 100', async () => {
      planningRepository.createPlan.mockResolvedValue({ id: 'plan-1' } as any);

      const result = await planningService.createWeeklyPlan(validData);

      expect(planningRepository.createPlan).toHaveBeenCalledWith(
        expect.objectContaining({ totalAvailableHours: 30 }),
        expect.arrayContaining([
          { category: 'CLIENT', allocatedHours: 15 },
          { category: 'TECH_DEBT', allocatedHours: 9 },
          { category: 'RND', allocatedHours: 6 }
        ])
      );
      expect(result.id).toBe('plan-1');
    });

    it('should throw error if percentages do not total 100', async () => {
      const invalidData = { ...validData, clientPercentage: 40 };

      await expect(planningService.createWeeklyPlan(invalidData)).rejects.toThrow(
        new AppError('Total allocation percentage must equal 100%', 400)
      );
    });
  });

  describe('freezePlan', () => {
    it('should freeze a plan if it exists', async () => {
      planningRepository.findById.mockResolvedValue({ id: '1' } as any);
      planningRepository.updatePlan.mockResolvedValue({ id: '1', isFrozen: true } as any);

      const result = await planningService.freezePlan('1');

      expect(planningRepository.updatePlan).toHaveBeenCalledWith('1', { isFrozen: true });
      expect(result.isFrozen).toBe(true);
    });

    it('should throw error if plan not found', async () => {
      planningRepository.findById.mockResolvedValue(null);

      await expect(planningService.freezePlan('invalid')).rejects.toThrow(
        new AppError('Plan not found', 404)
      );
    });
  });

  describe('getCurrentPlan', () => {
    it('should return the current plan', async () => {
      const plan = { id: 'current' };
      planningRepository.findCurrentPlan.mockResolvedValue(plan as any);

      const result = await planningService.getCurrentPlan();

      expect(result).toEqual(plan);
    });
  });
});
