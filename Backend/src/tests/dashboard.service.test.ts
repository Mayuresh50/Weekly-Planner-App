import { DashboardService } from '../services/dashboard.service';
import { AssignmentRepository } from '../repositories/assignment.repository';
import { PlanningRepository } from '../repositories/planning.repository';
import { AppError } from '../middleware/error.middleware';

jest.mock('../repositories/assignment.repository');
jest.mock('../repositories/planning.repository');

describe('DashboardService', () => {
  let dashboardService: DashboardService;
  let assignmentRepository: jest.Mocked<AssignmentRepository>;
  let planningRepository: jest.Mocked<PlanningRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    assignmentRepository = new AssignmentRepository() as jest.Mocked<AssignmentRepository>;
    planningRepository = new PlanningRepository() as jest.Mocked<PlanningRepository>;
    
    dashboardService = new DashboardService();
    (dashboardService as any).assignmentRepository = assignmentRepository;
    (dashboardService as any).planningRepository = planningRepository;
  });

  describe('getWeeklySummary', () => {
    it('should return full summary with utilization and progress', async () => {
      const mockPlan = {
        id: 'plan-1',
        startDate: new Date(),
        endDate: new Date(),
        isFrozen: false,
        totalAvailableHours: 30,
        allocations: [{ category: 'CLIENT', allocatedHours: 15 }]
      };
      
      const mockAssignments = [
        { 
          id: 'asgn-1', 
          userId: 'u1', 
          assignedHours: 10, 
          status: 'PLANNED', 
          user: { name: 'Alice' },
          backlogItem: { title: 'T1', category: 'CLIENT' },
          progressPercentage: 20
        }
      ];

      planningRepository.findById.mockResolvedValue(mockPlan as any);
      assignmentRepository.findAssignmentsByPlan.mockResolvedValue(mockAssignments as any);

      const result: any = await dashboardService.getWeeklySummary('plan-1', {});

      expect(result.planSummary.totalAvailable).toBe(30);
      expect(result.categoryUtilization[0].category).toBe('CLIENT');
      expect(result.categoryUtilization[0].used).toBe(10);
      expect(result.memberProgress[0].name).toBe('Alice');
      expect(result.taskLevelProgress[0].title).toBe('T1');
    });

    it('should throw if plan not found', async () => {
      planningRepository.findById.mockResolvedValue(null);
      await expect(dashboardService.getWeeklySummary('invalid', {})).rejects.toThrow('Plan not found');
    });
  });
});
