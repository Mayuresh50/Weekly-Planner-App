import { BacklogService } from '../src/services/backlog.service';
import { BacklogRepository } from '../src/repositories/backlog.repository';

jest.mock('../src/repositories/backlog.repository');

describe('BacklogService', () => {
  let backlogService: BacklogService;
  let backlogRepository: jest.Mocked<BacklogRepository>;

  beforeEach(() => {
    backlogRepository = new BacklogRepository() as jest.Mocked<BacklogRepository>;
    backlogService = new BacklogService();
    (backlogService as any).backlogRepository = backlogRepository;
  });

  describe('createBacklogItem', () => {
    it('should create an item', async () => {
      const data = { title: 'Test', description: 'Desc', category: 'CLIENT', estimatedHours: 5 };
      backlogRepository.create.mockResolvedValue({ id: '1', ...data, status: 'BACKLOG', createdAt: new Date(), updatedAt: new Date() } as any);

      const result = await backlogService.createBacklogItem(data);

      expect(result.id).toBe('1');
      expect(backlogRepository.create).toHaveBeenCalledWith(data);
    });
  });

  describe('getBacklogItem', () => {
    it('should return item if found', async () => {
      backlogRepository.findById.mockResolvedValue({ id: '1', title: 'Test' } as any);
      const result = await backlogService.getBacklogItem('1');
      expect(result.id).toBe('1');
    });

    it('should throw error if not found', async () => {
      backlogRepository.findById.mockResolvedValue(null);
      await expect(backlogService.getBacklogItem('1')).rejects.toThrow('Backlog item not found');
    });
  });

  describe('updateBacklogItem', () => {
    it('should update item if found', async () => {
      backlogRepository.findById.mockResolvedValue({ id: '1' } as any);
      backlogRepository.update.mockResolvedValue({ id: '1', title: 'Updated' } as any);
      const result = await backlogService.updateBacklogItem('1', { title: 'Updated' });
      expect(result.title).toBe('Updated');
    });
  });

  describe('deleteBacklogItem', () => {
    it('should delete item if found', async () => {
      backlogRepository.findById.mockResolvedValue({ id: '1' } as any);
      backlogRepository.delete.mockResolvedValue({ id: '1' } as any);
      await backlogService.deleteBacklogItem('1');
      expect(backlogRepository.delete).toHaveBeenCalledWith('1');
    });
  });
});
