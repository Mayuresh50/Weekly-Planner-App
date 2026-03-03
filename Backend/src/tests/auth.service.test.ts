import { AuthService } from '../src/services/auth.service';
import { UserRepository } from '../src/repositories/user.repository';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

jest.mock('../src/repositories/user.repository');
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepository = new UserRepository() as jest.Mocked<UserRepository>;
    authService = new AuthService();
    (authService as any).userRepository = userRepository;
  });

  describe('signup', () => {
    it('should create a new user and return a token', async () => {
      const userData = { email: 'test@example.com', password: 'password123', name: 'Test User', role: 'TEAM_MEMBER' as any };
      const createdUser = { id: '1', ...userData, password: 'hashedpassword' };
      
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(createdUser as any);
      (jwt.sign as jest.Mock).mockReturnValue('fake-token');

      const result = await authService.signup(userData);

      expect(result.token).toBe('fake-token');
      expect(result.user.email).toBe(userData.email);
    });

    it('should throw error if user already exists', async () => {
      userRepository.findByEmail.mockResolvedValue({ id: '1' } as any);
      
      await expect(authService.signup({ email: 'test@example.com' } as any))
        .rejects.toThrow('User with this email already exists');
    });
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      const user = { id: '1', email: 'test@example.com', password: 'hashedpassword', role: 'TEAM_MEMBER' };
      
      userRepository.findByEmail.mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('fake-token');

      const result = await authService.login('test@example.com', 'password123');

      expect(result.token).toBe('fake-token');
      expect(result.user.id).toBe('1');
    });

    it('should throw error for invalid credentials', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      
      await expect(authService.login('test@example.com', 'password123'))
        .rejects.toThrow('Invalid email or password');
    });
  });
});
