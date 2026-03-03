import { AuthService } from '../services/auth.service';
import { UserRepository } from '../repositories/user.repository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/error.middleware';

jest.mock('../repositories/user.repository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
    userRepository = new UserRepository() as jest.Mocked<UserRepository>;
    authService = new AuthService();
    (authService as any).userRepository = userRepository;
  });

  describe('signup', () => {
    const signupData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'TEAM_MEMBER'
    };

    it('should create a new user and return user and token', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      const createdUser = { id: 'user-123', ...signupData, password: 'hashedPassword' };
      userRepository.create.mockResolvedValue(createdUser as any);
      (jwt.sign as jest.Mock).mockReturnValue('fake-token');

      const result = await authService.signup(signupData);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(signupData.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(signupData.password, 12);
      expect(userRepository.create).toHaveBeenCalled();
      expect(result).toEqual({ user: createdUser, token: 'fake-token' });
    });

    it('should throw AppError if email is already in use', async () => {
      userRepository.findByEmail.mockResolvedValue({ id: 'existing' } as any);

      await expect(authService.signup(signupData)).rejects.toThrow(
        new AppError('Email already in use', 400)
      );
    });
  });

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should return user and token for valid credentials', async () => {
      const user = { id: 'user-123', email: loginData.email, password: 'hashedPassword', role: 'TEAM_MEMBER' };
      userRepository.findByEmail.mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('fake-token');

      const result = await authService.login(loginData);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, 'hashedPassword');
      expect(result).toEqual({ user, token: 'fake-token' });
    });

    it('should throw 401 for non-existent user', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.login(loginData)).rejects.toThrow(
        new AppError('Incorrect email or password', 401)
      );
    });

    it('should throw 401 for incorrect password', async () => {
      userRepository.findByEmail.mockResolvedValue({ password: 'hashed' } as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginData)).rejects.toThrow(
        new AppError('Incorrect email or password', 401)
      );
    });
  });

  describe('generateToken', () => {
    it('should throw error if JWT_SECRET is not defined', async () => {
      delete process.env.JWT_SECRET;
      // Need a public way or trigger to call private method for 100% coverage
      // Usually signup/login covers this, but testing the branch directly via any cast
      expect(() => (authService as any).generateToken('id')).toThrow(
        'JWT_SECRET is not defined in environment variables'
      );
    });
  });
});