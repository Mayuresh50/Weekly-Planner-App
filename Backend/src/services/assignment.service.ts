import { AssignmentRepository } from '../repositories/assignment.repository';
import { PlanningRepository } from '../repositories/planning.repository';
import { BacklogRepository } from '../repositories/backlog.repository';
import { AppError } from '../middleware/error.middleware';

export class AssignmentService {
  private assignmentRepository: AssignmentRepository;
  private planningRepository: PlanningRepository;
  private backlogRepository: BacklogRepository;

  constructor() {
    this.assignmentRepository = new AssignmentRepository();
    this.planningRepository = new PlanningRepository();
    this.backlogRepository = new BacklogRepository();
  }

  async assignTask(data: any) {
    const { weeklyPlanId, backlogItemId, userId, assignedHours } = data;

    // 1. Check if plan is frozen
    const plan = await this.planningRepository.findById(weeklyPlanId);
    if (!plan) throw new AppError('Weekly plan not found', 404);
    if (plan.isFrozen) throw new AppError('Weekly plan is frozen', 400);

    // 2. Check individual limit (30h)
    const userAssignments = await this.assignmentRepository.findByPlanAndUser(weeklyPlanId, userId);
    const totalUserHours = userAssignments.reduce((sum: number, a: any) => sum + a.assignedHours, 0);
    if (totalUserHours + assignedHours > 30) {
      throw new AppError('User cannot exceed 30 hours per week', 400);
    }

    // 3. Check category allocation limit
    const backlogItem = await this.backlogRepository.findById(backlogItemId);
    if (!backlogItem) throw new AppError('Backlog item not found', 404);

    const categoryAllocation = plan.allocations.find((a: any) => a.category === backlogItem.category);
    if (!categoryAllocation) throw new AppError('Category allocation not found in plan', 400);

    const categoryAssignments = await this.assignmentRepository.findByPlanAndCategory(weeklyPlanId, backlogItem.category);
    const totalCategoryHours = categoryAssignments.reduce((sum: number, a: any) => sum + a.assignedHours, 0);
    
    if (totalCategoryHours + assignedHours > categoryAllocation.allocatedHours) {
      throw new AppError(`Exceeds ${backlogItem.category} allocation limit of ${categoryAllocation.allocatedHours} hours`, 400);
    }

    return this.assignmentRepository.create({
      weeklyPlanId,
      backlogItemId,
      userId,
      assignedHours,
      status: 'PLANNED'
    });
  }

  async updateProgress(assignmentId: string, progressPercentage: number, userId: string, userRole: string) {
    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment) throw new AppError('Assignment not found', 404);

    // Only members can update their own tasks, Leads can update anything
    if (userRole === 'TEAM_MEMBER' && assignment.userId !== userId) {
      throw new AppError('You can only update your own tasks', 403);
    }

    if (progressPercentage < 0 || progressPercentage > 100) {
      throw new AppError('Progress must be between 0 and 100', 400);
    }

    return this.assignmentRepository.updateProgress(assignmentId, progressPercentage);
  }
}
