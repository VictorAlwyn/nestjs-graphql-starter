import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';

import { AuthService } from '../../src/modules/auth/auth.service';
import { BetterAuthService } from '../../src/infra/better-auth/better-auth.service';
import { EmailService } from '../../src/infra/email/email.service';

describe('AuthService', () => {
  let service: AuthService;
  let betterAuthService: jest.Mocked<BetterAuthService>;
  let emailService: jest.Mocked<EmailService>;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER' as const,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSession = {
    user: mockUser,
    token: 'mock-jwt-token',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: BetterAuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
            getSession: jest.fn(),
            validateToken: jest.fn(),
            requestPasswordReset: jest.fn(),
            resetPassword: jest.fn(),
            loginWithOAuth: jest.fn(),
            getOAuthUrl: jest.fn(),
            getOAuthProviders: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendEmail: jest.fn(),
            sendTemplateEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    betterAuthService = module.get(BetterAuthService);
    emailService = module.get(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerInput = {
        email: 'newuser@example.com',
        password: 'ValidPassword123!',
        name: 'New User',
      };

      betterAuthService.register.mockResolvedValue(mockSession);

      const result = await service.register(registerInput);

      expect(betterAuthService.register).toHaveBeenCalledWith(registerInput);
      expect(result).toEqual(mockSession);
    });

    it('should throw UnauthorizedException when registration fails', async () => {
      const registerInput = {
        email: 'existing@example.com',
        password: 'ValidPassword123!',
        name: 'Existing User',
      };

      betterAuthService.register.mockRejectedValue(
        new Error('User already exists'),
      );

      await expect(service.register(registerInput)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(betterAuthService.register).toHaveBeenCalledWith(registerInput);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginInput = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
      };

      betterAuthService.login.mockResolvedValue(mockSession);

      const result = await service.login(loginInput);

      expect(betterAuthService.login).toHaveBeenCalledWith(loginInput);
      expect(result).toEqual(mockSession);
    });

    it('should throw UnauthorizedException when login fails', async () => {
      const loginInput = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      betterAuthService.login.mockRejectedValue(
        new Error('Invalid credentials'),
      );

      await expect(service.login(loginInput)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(betterAuthService.login).toHaveBeenCalledWith(loginInput);
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const mockRequest = { headers: { authorization: 'Bearer mock-token' } };

      betterAuthService.logout.mockResolvedValue(true);

      const result = await service.logout(mockRequest);

      expect(betterAuthService.logout).toHaveBeenCalledWith(mockRequest);
      expect(result).toBe(true);
    });

    it('should handle logout failure gracefully', async () => {
      const mockRequest = {
        headers: { authorization: 'Bearer invalid-token' },
      };

      betterAuthService.logout.mockRejectedValue(new Error('Logout failed'));

      await expect(service.logout(mockRequest)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(betterAuthService.logout).toHaveBeenCalledWith(mockRequest);
    });
  });

  describe('validateToken', () => {
    it('should validate token successfully', async () => {
      const token = 'valid-jwt-token';

      betterAuthService.validateToken.mockResolvedValue(true);

      const result = await service.validateToken(token);

      expect(betterAuthService.validateToken).toHaveBeenCalledWith(token);
      expect(result).toBe(true);
    });

    it('should return false for invalid token', async () => {
      const token = 'invalid-jwt-token';

      betterAuthService.validateToken.mockResolvedValue(false);

      const result = await service.validateToken(token);

      expect(betterAuthService.validateToken).toHaveBeenCalledWith(token);
      expect(result).toBe(false);
    });
  });

  describe('requestPasswordReset', () => {
    it('should request password reset successfully', async () => {
      const email = 'test@example.com';

      betterAuthService.requestPasswordReset.mockResolvedValue(true);
      emailService.sendEmail.mockResolvedValue(true);

      const result = await service.requestPasswordReset(email);

      expect(betterAuthService.requestPasswordReset).toHaveBeenCalledWith(
        email,
      );
      expect(result).toBe(true);
    });

    it('should handle password reset request failure', async () => {
      const email = 'nonexistent@example.com';

      betterAuthService.requestPasswordReset.mockRejectedValue(
        new Error('User not found'),
      );

      await expect(service.requestPasswordReset(email)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(betterAuthService.requestPasswordReset).toHaveBeenCalledWith(
        email,
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const token = 'valid-reset-token';
      const newPassword = 'NewPassword123!';

      betterAuthService.resetPassword.mockResolvedValue(true);

      const result = await service.resetPassword(token, newPassword);

      expect(betterAuthService.resetPassword).toHaveBeenCalledWith(
        token,
        newPassword,
      );
      expect(result).toBe(true);
    });

    it('should handle password reset failure', async () => {
      const token = 'invalid-reset-token';
      const newPassword = 'NewPassword123!';

      betterAuthService.resetPassword.mockRejectedValue(
        new Error('Invalid token'),
      );

      await expect(service.resetPassword(token, newPassword)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(betterAuthService.resetPassword).toHaveBeenCalledWith(
        token,
        newPassword,
      );
    });
  });

  describe('getOAuthUrl', () => {
    it('should return OAuth URL for valid provider', async () => {
      const provider = 'google';
      const expectedUrl =
        'https://accounts.google.com/oauth/authorize?client_id=test&redirect_uri=test';

      betterAuthService.getOAuthUrl.mockResolvedValue(expectedUrl);

      const result = await service.getOAuthUrl(provider);

      expect(betterAuthService.getOAuthUrl).toHaveBeenCalledWith(provider);
      expect(result).toBe(expectedUrl);
    });

    it('should throw error for invalid provider', async () => {
      const provider = 'invalid-provider';

      betterAuthService.getOAuthUrl.mockRejectedValue(
        new Error('Invalid provider'),
      );

      await expect(service.getOAuthUrl(provider)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(betterAuthService.getOAuthUrl).toHaveBeenCalledWith(provider);
    });
  });

  describe('getOAuthProviders', () => {
    it('should return available OAuth providers', async () => {
      const expectedProviders = ['google', 'facebook'];

      betterAuthService.getOAuthProviders.mockResolvedValue(expectedProviders);

      const result = await service.getOAuthProviders();

      expect(betterAuthService.getOAuthProviders).toHaveBeenCalled();
      expect(result).toEqual(expectedProviders);
    });
  });
});
