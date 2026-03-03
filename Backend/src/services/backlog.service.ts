import { BacklogRepository } from '../repositories/backlog.repository';
import { AppError } from '../middleware/error.middleware';

export class BacklogService {
  private backlogRepository: BacklogRepository;

  constructor() {
    this.backlogRepository = new BacklogRepository();
  }

  async getAllBacklogItems(filters: any) {
    return this.backlogRepository.findAll(filters);
  }

  async getBacklogItem(id: string) {
    const item = await this.backlogRepository.findById(id);
    if (!item) throw new AppError('Backlog item not found', 404);
    return item;
  }

  async createBacklogItem(data: any) {
    return this.backlogRepository.create(data);
  }

  async updateBacklogItem(id: string, data: any) {
    await this.getBacklogItem(id);
    return this.backlogRepository.update(id, data);
  }

  async deleteBacklogItem(id: string) {
    await this.getBacklogItem(id);
    return this.backlogRepository.delete(id);
  }
}
