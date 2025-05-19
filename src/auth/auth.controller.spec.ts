import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

const mockAuthService = {
  register: jest.fn((name, email, password) => {
    return Promise.resolve({ id: 1, name, email });
  }),
  login: jest.fn((email, password) => {
    if (email === 'chris@test.com' && password === 'password') {
      return Promise.resolve({ token: 'mock-jwt-token' });
    }
    throw new Error('Invalid credentials');
  }),
};

const mockJwtAuthGuard = {
  canActivate: (context: ExecutionContext) => true,
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should register a user', async () => {
    const result = await controller.register({
      name: 'Christ Test',
      email: 'chris@test.com',
      password: '123123123',
    });
    expect(result).toEqual({
      id: 1,
      name: 'Christ Test',
      email: 'chris@test.com',
    });
    expect(mockAuthService.register).toHaveBeenCalledWith(
      'Christ Test',
      'chris@test.com',
      '123123123',
    );
  });

  it('should login a user with correct credentials', async () => {
    const result = await controller.login({
      email: 'chris@test.com',
      password: 'password',
    });
    expect(result).toEqual({ token: 'mock-jwt-token' });
  });

  it('should return current user for /me route', async () => {
    const user = { userId: 1, name: 'Christian Steffens', email: 'chris@steffens.com' };
    const result = controller.getMe(user);
    expect(result).toEqual(user);
  });
});
