import { AssignmentService } from '../services/assignment.service';
import { AssignmentRepository } from '../repositories/assignment.repository';
import { PlanningRepository } from '../repositories/planning.repository';
import { BacklogRepository } from '../repositories/backlog.repository';
import { AppError } from '../middleware/error.middleware';

jest.mock('../repositories/assignment.repository');
jest.mock('../repositories/planning.repository');
jest.mock('../repositories/backlog.repository');

describe('AssignmentService', () => {
  let assignmentService: AssignmentService;
  let assignmentRepository: jest.Mocked<AssignmentRepository>;
  let planningRepository: jest.Mocked<PlanningRepository>;
  let backlogRepository: jest.Mocked<BacklogRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    assignmentRepository = new AssignmentRepository() as jest.Mocked<AssignmentRepository>;
    planningRepository = new PlanningRepository() as jest.Mocked<PlanningRepository>;
    backlogRepository = new BacklogRepository() as jest.Mocked<BacklogRepository>;
    
    assignmentService = new AssignmentService();
    (assignmentService as any).assignmentRepository = assignmentRepository;
    (assignmentService as any).planningRepository = planningRepository;
    (assignmentService as any).backlogRepository = backlogRepository;
  });

  describe('assignTask', () => {
    const assignData = {
      weeklyPlanId: 'plan-1',
      backlogItemId: 'item-1',
      userId: 'user-1',
      assignedHours: 10
    };

    it('should create assignment if all validations pass', async () => {
      planningRepository.findById.mockResolvedValue({ 
        id: 'plan-1', 
        isFrozen: false,
        allocations: [{ category: 'CLIENT', allocatedHours: 15 }]
      } as any);
      assignmentRepository.findByPlanAndUser.mockResolvedValue([]);
      backlogRepository.findById.mockResolvedValue({ id: 'item-1', category: 'CLIENT' } as any);
      assignmentRepository.findByPlanAndCategory.mockResolvedValue([]);
      assignmentRepository.create.mockResolvedValue({ id: 'asgn-1' } as any);

      const result = await assignmentService.assignTask(assignData);

      expect(assignmentRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        weeklyPlanId: 'plan-1',
        status: 'PLANNED'
      }));
      expect(result.id).toBe('asgn-1');
    });

    it('should throw if plan not found', async () => {
      planningRepository.findById.mockResolvedValue(null);
      await expect(assignmentService.assignTask(assignData)).rejects.toThrow('Weekly plan not found');
    });

    it('should throw if plan is frozen', async () => {
      planningRepository.findById.mockResolvedValue({ isFrozen: true } as any);
      await expect(assignmentService.assignTask(assignData)).rejects.toThrow('Weekly plan is frozen');
    });

    it('should throw if personal limit exceeded', async () => {
      planningRepository.findById.mockResolvedValue({ isFrozen: false } as any);
      assignmentRepository.findByPlanAndUser.mockResolvedValue([{ assignedHours: 25 }] as any);
      await expect(assignmentService.assignTask(assignData)).rejects.toThrow('User cannot exceed 30 hours per week');
    });

    it('should throw if category limit exceeded', async () => {
      planningRepository.findById.mockResolvedValue({ 
        isFrozen: false,
        allocations: [{ category: 'CLIENT', allocatedHours: 15 }]
      } as any);
      assignmentRepository.findByPlanAndUser.mockResolvedValue([]);
      backlogRepository.findById.mockResolvedValue({ id: 'item-1', category: 'CLIENT' } as any);
      assignmentRepository.findByPlanAndCategory.mockResolvedValue([{ assignedHours: 10 }] as any);
      
      await expect(assignmentService.assignTask(assignData)).rejects.toThrow(/Exceeds CLIENT allocation limit/);
    });
  });

  describe('updateProgress', () => {
    it('should update progress if authorization passes', async () => {
      assignmentRepository.findById.mockResolvedValue({ id: 'asgn-1', userId: 'user-1' } as any);
      assignmentRepository.updateProgress.mockResolvedValue({ id: 'asgn-1', progressPercentage: 50 } as any);

      const result: any = await assignmentService.updateProgress('asgn-1', 50, 'user-1', 'TEAM_MEMBER');

      expect(assignmentRepository.updateProgress).toHaveBeenCalledWith('asgn-1', 50);
      expect(result.progressPercentage).toBe(50);
    });

    it('should throw if member updates someone else task', async () => {
      assignmentRepository.findById.mockResolvedValue({ id: 'asgn-1', userId: 'user-other' } as any);
      
      await expect(assignmentService.updateProgress('asgn-1', 50, 'user-me', 'TEAM_MEMBER'))
        .rejects.toThrow('You can only update your own tasks');
    });

    it('should allow lead to update anyone task', async () => {
      assignmentRepository.findById.mockResolvedValue({ id: 'asgn-1', userId: 'user-other' } as any);
      assignmentRepository.updateProgress.mockResolvedValue({ id: 'asgn-1' } as any);

      await assignmentService.updateProgress('asgn-1', 50, 'lead-id', 'TEAM_LEAD');
      expect(assignmentRepository.updateProgress).toHaveBeenCalled();
    });
  });
});
