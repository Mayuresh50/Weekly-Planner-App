import { PlanningRepository } from '../repositories/planning.repository';
import { AppError } from '../middleware/error.middleware';

export class PlanningService {
  private planningRepository: PlanningRepository;

  constructor() {
    this.planningRepository = new PlanningRepository();
  }

  async createWeeklyPlan(data: any) {
    const { clientPercentage, techDebtPercentage, rndPercentage, startDate, endDate } = data;

    if (clientPercentage + techDebtPercentage + rndPercentage !== 100) {
      throw new AppError('Total allocation percentage must equal 100%', 400);
    }

    const totalHours = 30; // Defined in requirement
    const allocations = [
      { category: 'CLIENT', allocatedHours: (clientPercentage / 100) * totalHours },
      { category: 'TECH_DEBT', allocatedHours: (techDebtPercentage / 100) * totalHours },
      { category: 'RND', allocatedHours: (rndPercentage / 100) * totalHours },
    ];

    return this.planningRepository.createPlan(
      { startDate, endDate, clientPercentage, techDebtPercentage, rndPercentage, totalAvailableHours: totalHours },
      allocations
    );
  }

  async freezePlan(id: string) {
    const plan = await this.planningRepository.findById(id);
    if (!plan) throw new AppError('Plan not found', 404);
    
    return this.planningRepository.updatePlan(id, { isFrozen: true });
  }

  async getCurrentPlan() {
    return this.planningRepository.findCurrentPlan();
  }
}
