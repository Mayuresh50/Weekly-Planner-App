import { AssignmentRepository } from '../repositories/assignment.repository';
import { PlanningRepository } from '../repositories/planning.repository';
import { AppError } from '../middleware/error.middleware';

export class DashboardService {
  private assignmentRepository: AssignmentRepository;
  private planningRepository: PlanningRepository;

  constructor() {
    this.assignmentRepository = new AssignmentRepository();
    this.planningRepository = new PlanningRepository();
  }

  async getWeeklySummary(weeklyPlanId: string, filters: any) {
    const plan = await this.planningRepository.findById(weeklyPlanId);
    if (!plan) throw new AppError('Plan not found', 404);

    const assignments = await this.assignmentRepository.findAssignmentsByPlan(weeklyPlanId);
    
    // Applying filters manually or we could do it in repo. For now, manual:
    let filteredAssignments = assignments;
    if (filters.member) filteredAssignments = filteredAssignments.filter((a: any) => a.userId === filters.member);
    if (filters.category) filteredAssignments = filteredAssignments.filter((a: any) => a.backlogItem.category === filters.category);
    if (filters.status) filteredAssignments = filteredAssignments.filter((a: any) => a.status === filters.status);

    const totalPlannedHours = assignments.reduce((sum: number, a: any) => sum + a.assignedHours, 0);
    
    const categoryUtilization = plan.allocations.map((alloc: any) => {
      const catAssignments = assignments.filter((a: any) => a.backlogItem.category === alloc.category);
      const usedHours = catAssignments.reduce((sum: number, a: any) => sum + a.assignedHours, 0);
      return {
        category: alloc.category,
        allocated: alloc.allocatedHours,
        used: usedHours,
        percentage: (usedHours / alloc.allocatedHours) * 100
      };
    });

    const memberProgress = assignments.reduce((acc: any, curr: any) => {
      const userId = curr.userId;
      if (!acc[userId]) acc[userId] = { name: curr.user.name, tasks: 0, completed: 0, totalHours: 0 };
      acc[userId].tasks += 1;
      acc[userId].totalHours += curr.assignedHours;
      if (curr.status === 'COMPLETED') acc[userId].completed += 1;
      return acc;
    }, {});

    return {
      planSummary: {
        startDate: plan.startDate,
        endDate: plan.endDate,
        isFrozen: plan.isFrozen,
        totalAvailable: plan.totalAvailableHours,
        totalPlanned: totalPlannedHours
      },
      categoryUtilization,
      memberProgress: Object.values(memberProgress),
      taskLevelProgress: filteredAssignments.map(a => ({
        id: a.id,
        title: a.backlogItem.title,
        member: a.user.name,
        category: a.backlogItem.category,
        status: a.status,
        progress: a.progressPercentage,
        hours: a.assignedHours
      }))
    };
  }
}
