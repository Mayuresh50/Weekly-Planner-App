import { BacklogService } from '../services/backlog.service';
import { BacklogRepository } from '../repositories/backlog.repository';
import { AppError } from '../middleware/error.middleware';

jest.mock('../repositories/backlog.repository');

describe('BacklogService', () => {
  let backlogService: BacklogService;
  let backlogRepository: jest.Mocked<BacklogRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    backlogRepository = new BacklogRepository() as jest.Mocked<BacklogRepository>;
    backlogService = new BacklogService();
    (backlogService as any).backlogRepository = backlogRepository;
  });

  describe('getAllBacklogItems', () => {
    it('should return all items from repository', async () => {
      const mockItems = [{ id: '1', title: 'Task 1' }];
      backlogRepository.findAll.mockResolvedValue(mockItems as any);

      const result = await backlogService.getAllBacklogItems({ status: 'BACKLOG' });

      expect(backlogRepository.findAll).toHaveBeenCalledWith({ status: 'BACKLOG' });
      expect(result).toEqual(mockItems);
    });
  });

  describe('getBacklogItem', () => {
    it('should return an item if it exists', async () => {
      const mockItem = { id: '1', title: 'Task 1' };
      backlogRepository.findById.mockResolvedValue(mockItem as any);

      const result = await backlogService.getBacklogItem('1');

      expect(backlogRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockItem);
    });

    it('should throw 404 if item does not exist', async () => {
      backlogRepository.findById.mockResolvedValue(null);

      await expect(backlogService.getBacklogItem('invalid')).rejects.toThrow(
        new AppError('Backlog item not found', 404)
      );
    });
  });

  describe('createBacklogItem', () => {
    it('should create and return a new item', async () => {
      const data = { title: 'New task', category: 'CLIENT', estimatedHours: 5 };
      const created = { id: '2', ...data };
      backlogRepository.create.mockResolvedValue(created as any);

      const result = await backlogService.createBacklogItem(data);

      expect(backlogRepository.create).toHaveBeenCalledWith(data);
      expect(result).toEqual(created);
    });
  });

  describe('updateBacklogItem', () => {
    it('should update and return the item if it exists', async () => {
      const id = '1';
      const updateData = { title: 'Updated' };
      backlogRepository.findById.mockResolvedValue({ id } as any);
      backlogRepository.update.mockResolvedValue({ id, ...updateData } as any);

      const result = await backlogService.updateBacklogItem(id, updateData);

      expect(backlogRepository.findById).toHaveBeenCalledWith(id);
      expect(backlogRepository.update).toHaveBeenCalledWith(id, updateData);
      expect(result.title).toBe('Updated');
    });
  });

  describe('deleteBacklogItem', () => {
    it('should delete the item if it exists', async () => {
      const id = '1';
      backlogRepository.findById.mockResolvedValue({ id } as any);
      backlogRepository.delete.mockResolvedValue({ id } as any);

      await backlogService.deleteBacklogItem(id);

      expect(backlogRepository.findById).toHaveBeenCalledWith(id);
      expect(backlogRepository.delete).toHaveBeenCalledWith(id);
    });
  });
});