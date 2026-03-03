import { TaskAssignment, ProgressLog, BacklogStatus } from '@prisma/client';
import prisma from '../config/prisma';

export class AssignmentRepository {
  async findByPlanAndUser(weeklyPlanId: string, userId: string): Promise<TaskAssignment[]> {
    return prisma.taskAssignment.findMany({
      where: { weeklyPlanId, userId },
    });
  }

  async findByPlanAndCategory(weeklyPlanId: string, category: string): Promise<TaskAssignment[]> {
    return prisma.taskAssignment.findMany({
      where: {
        weeklyPlanId,
        backlogItem: { category: category as any },
      },
      include: { backlogItem: true },
    });
  }

  async create(data: any): Promise<TaskAssignment> {
    return prisma.$transaction(async (tx: any) => {
      const assignment = await tx.taskAssignment.create({ data });
      await tx.backlogItem.update({
        where: { id: data.backlogItemId },
        data: { status: 'PLANNED' },
      });
      return assignment;
    });
  }

  async updateProgress(id: string, progressPercentage: number): Promise<TaskAssignment> {
    let status: BacklogStatus = 'IN_PROGRESS';
    if (progressPercentage === 0) status = 'PLANNED';
    if (progressPercentage === 100) status = 'COMPLETED';

    return prisma.$transaction(async (tx: any) => {
      const assignment = await tx.taskAssignment.update({
        where: { id },
        data: { progressPercentage, status },
      });

      await tx.backlogItem.update({
        where: { id: assignment.backlogItemId },
        data: { status },
      });

      await tx.progressLog.create({
        data: {
          taskAssignmentId: id,
          progressPercentage,
        },
      });

      return assignment;
    });
  }

  async findById(id: string): Promise<TaskAssignment | null> {
    return prisma.taskAssignment.findUnique({
      where: { id },
      include: { weeklyPlan: true, backlogItem: true },
    });
  }

  async findAssignmentsByPlan(weeklyPlanId: string) {
    return prisma.taskAssignment.findMany({
      where: { weeklyPlanId },
      include: { backlogItem: true, user: true },
    });
  }
}
