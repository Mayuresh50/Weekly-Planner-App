import { WeeklyPlan, PlanAllocation, Category } from '@prisma/client';
import prisma from '../config/prisma';

export class PlanningRepository {
  async findCurrentPlan(): Promise<any | null> {
    const now = new Date();
    return prisma.weeklyPlan.findFirst({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: { allocations: true },
    });
  }

  async createPlan(data: any, allocations: any[]): Promise<any> {
    return prisma.weeklyPlan.create({
      data: {
        ...data,
        allocations: {
          create: allocations,
        },
      },
      include: { allocations: true },
    });
  }

  async updatePlan(id: string, data: any): Promise<any> {
    return prisma.weeklyPlan.update({
      where: { id },
      data,
      include: { allocations: true },
    });
  }

  async findById(id: string): Promise<any | null> {
    return prisma.weeklyPlan.findUnique({
      where: { id },
      include: { allocations: true },
    });
  }
}
