import { BacklogItem, Category, BacklogStatus } from '@prisma/client';
import prisma from '../config/prisma';

export class BacklogRepository {
  async findAll(filters: any): Promise<BacklogItem[]> {
    return prisma.backlogItem.findMany({ where: filters });
  }

  async findById(id: string): Promise<BacklogItem | null> {
    return prisma.backlogItem.findUnique({ where: { id } });
  }

  async create(data: any): Promise<BacklogItem> {
    return prisma.backlogItem.create({ data });
  }

  async update(id: string, data: any): Promise<BacklogItem> {
    return prisma.backlogItem.update({ where: { id }, data });
  }

  async delete(id: string): Promise<BacklogItem> {
    return prisma.backlogItem.delete({ where: { id } });
  }
}
