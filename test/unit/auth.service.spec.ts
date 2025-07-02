import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { BetterAuthService } from '../../src/infra/better-auth/better-auth.service';
import { AuthService } from '../../src/modules/auth/auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let betterAuthService: jest.Mocked<BetterAuthService>;

  const mockBetterAuthUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    password: null,
    role: 'user',
    isActive: true,
    authProvider: 'email',
    providerId: null,
    avatarUrl: null,
    emailVerified: false,
    emailVerificationToken: null,
    passwordResetToken: null,
    passwordResetExpires: null,
    loginAttempts: 0,
    lockedUntil: null,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSession = {
    user: mockBetterAuthUser,
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
            registerWithEmail: jest.fn(),
            loginWithEmail: jest.fn(),
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
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    betterAuthService = module.get(BetterAuthService);
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

      const mockRegisterWithEmail =
        betterAuthService.registerWithEmail as jest.MockedFunction<
          typeof betterAuthService.registerWithEmail
        >;
      mockRegisterWithEmail.mockResolvedValue(mockSession);

      const result = await service.register(registerInput, {});

      expect(mockRegisterWithEmail).toHaveBeenCalledWith(
        registerInput.email,
        registerInput.password,
        registerInput.name,
        {},
      );
      expect(result).toEqual({
        token: mockSession.token,
        user: {
          id: mockBetterAuthUser.id,
          email: mockBetterAuthUser.email,
          name: mockBetterAuthUser.name,
          role: mockBetterAuthUser.role,
          isActive: mockBetterAuthUser.isActive,
          createdAt: mockBetterAuthUser.createdAt,
          updatedAt: mockBetterAuthUser.updatedAt,
        },
      });
    });

    it('should throw UnauthorizedException when registration fails', async () => {
      const registerInput = {
        email: 'existing@example.com',
        password: 'ValidPassword123!',
        name: 'Existing User',
      };

      const mockRegisterWithEmail =
        betterAuthService.registerWithEmail as jest.MockedFunction<
          typeof betterAuthService.registerWithEmail
        >;
      mockRegisterWithEmail.mockRejectedValue(new Error('User already exists'));

      await expect(service.register(registerInput, {})).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockRegisterWithEmail).toHaveBeenCalledWith(
        registerInput.email,
        registerInput.password,
        registerInput.name,
        {},
      );
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginInput = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
      };

      const mockLoginWithEmail =
        betterAuthService.loginWithEmail as jest.MockedFunction<
          typeof betterAuthService.loginWithEmail
        >;
      mockLoginWithEmail.mockResolvedValue(mockSession);

      const result = await service.login(loginInput, {});

      expect(mockLoginWithEmail).toHaveBeenCalledWith(
        loginInput.email,
        loginInput.password,
        {},
      );
      expect(result).toEqual({
        token: mockSession.token,
        user: {
          id: mockBetterAuthUser.id,
          email: mockBetterAuthUser.email,
          name: mockBetterAuthUser.name,
          role: mockBetterAuthUser.role,
          isActive: mockBetterAuthUser.isActive,
          createdAt: mockBetterAuthUser.createdAt,
          updatedAt: mockBetterAuthUser.updatedAt,
        },
      });
    });

    it('should throw UnauthorizedException when login fails', async () => {
      const loginInput = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      const mockLoginWithEmail =
        betterAuthService.loginWithEmail as jest.MockedFunction<
          typeof betterAuthService.loginWithEmail
        >;
      mockLoginWithEmail.mockRejectedValue(new Error('Invalid credentials'));

      await expect(service.login(loginInput, {})).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockLoginWithEmail).toHaveBeenCalledWith(
        loginInput.email,
        loginInput.password,
        {},
      );
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const mockRequest = { headers: { authorization: 'Bearer mock-token' } };

      const mockLogout = betterAuthService.logout as jest.MockedFunction<
        typeof betterAuthService.logout
      >;
      mockLogout.mockResolvedValue();

      await service.logout(mockRequest);

      expect(mockLogout).toHaveBeenCalledWith(mockRequest);
    });

    it('should handle logout failure gracefully', async () => {
      const mockRequest = {
        headers: { authorization: 'Bearer invalid-token' },
      };

      const mockLogout = betterAuthService.logout as jest.MockedFunction<
        typeof betterAuthService.logout
      >;
      mockLogout.mockRejectedValue(new Error('Logout failed'));

      await expect(service.logout(mockRequest)).rejects.toThrow(Error);
      expect(mockLogout).toHaveBeenCalledWith(mockRequest);
    });
  });

  describe('validateUser', () => {
    it('should validate token successfully', async () => {
      const token = 'valid-jwt-token';

      const mockValidateToken =
        betterAuthService.validateToken as jest.MockedFunction<
          typeof betterAuthService.validateToken
        >;
      mockValidateToken.mockResolvedValue(mockBetterAuthUser);

      const result = await service.validateUser(token);

      expect(mockValidateToken).toHaveBeenCalledWith(token);
      expect(result).toEqual({
        id: mockBetterAuthUser.id,
        email: mockBetterAuthUser.email,
        name: mockBetterAuthUser.name,
        role: mockBetterAuthUser.role,
        isActive: mockBetterAuthUser.isActive,
        createdAt: mockBetterAuthUser.createdAt,
        updatedAt: mockBetterAuthUser.updatedAt,
      });
    });

    it('should return null for invalid token', async () => {
      const token = 'invalid-jwt-token';

      const mockValidateToken =
        betterAuthService.validateToken as jest.MockedFunction<
          typeof betterAuthService.validateToken
        >;
      mockValidateToken.mockResolvedValue(null);

      const result = await service.validateUser(token);

      expect(mockValidateToken).toHaveBeenCalledWith(token);
      expect(result).toBe(null);
    });
  });

  describe('requestPasswordReset', () => {
    it('should request password reset successfully', async () => {
      const email = 'test@example.com';

      const mockRequestPasswordReset =
        betterAuthService.requestPasswordReset as jest.MockedFunction<
          typeof betterAuthService.requestPasswordReset
        >;
      mockRequestPasswordReset.mockResolvedValue();

      await service.requestPasswordReset(email, {});

      expect(mockRequestPasswordReset).toHaveBeenCalledWith(email, {});
    });

    it('should handle password reset request failure', async () => {
      const email = 'nonexistent@example.com';

      const mockRequestPasswordReset =
        betterAuthService.requestPasswordReset as jest.MockedFunction<
          typeof betterAuthService.requestPasswordReset
        >;
      mockRequestPasswordReset.mockRejectedValue(new Error('User not found'));

      await expect(service.requestPasswordReset(email, {})).rejects.toThrow(
        Error,
      );
      expect(mockRequestPasswordReset).toHaveBeenCalledWith(email, {});
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const token = 'valid-reset-token';
      const newPassword = 'NewPassword123!';

      const mockResetPassword =
        betterAuthService.resetPassword as jest.MockedFunction<
          typeof betterAuthService.resetPassword
        >;
      mockResetPassword.mockResolvedValue();

      await service.resetPassword(token, newPassword, {});

      expect(mockResetPassword).toHaveBeenCalledWith(token, newPassword, {});
    });

    it('should handle password reset failure', async () => {
      const token = 'invalid-reset-token';
      const newPassword = 'NewPassword123!';

      const mockResetPassword =
        betterAuthService.resetPassword as jest.MockedFunction<
          typeof betterAuthService.resetPassword
        >;
      mockResetPassword.mockRejectedValue(new Error('Invalid token'));

      await expect(
        service.resetPassword(token, newPassword, {}),
      ).rejects.toThrow(Error);
      expect(mockResetPassword).toHaveBeenCalledWith(token, newPassword, {});
    });
  });

  describe('getOAuthUrl', () => {
    it('should return OAuth URL for valid provider', () => {
      const provider = 'google';
      const expectedUrl =
        'https://accounts.google.com/oauth/authorize?client_id=test&redirect_uri=test';

      const mockGetOAuthUrl =
        betterAuthService.getOAuthUrl as jest.MockedFunction<
          typeof betterAuthService.getOAuthUrl
        >;
      mockGetOAuthUrl.mockReturnValue(expectedUrl);

      const result = service.getOAuthUrl(provider);

      expect(mockGetOAuthUrl).toHaveBeenCalledWith(provider);
      expect(result).toBe(expectedUrl);
    });

    it('should throw error for invalid provider', () => {
      const provider = 'invalid-provider';

      const mockGetOAuthUrl =
        betterAuthService.getOAuthUrl as jest.MockedFunction<
          typeof betterAuthService.getOAuthUrl
        >;
      mockGetOAuthUrl.mockImplementation(() => {
        throw new Error('Invalid provider');
      });

      expect(() => service.getOAuthUrl(provider)).toThrow(Error);
      expect(mockGetOAuthUrl).toHaveBeenCalledWith(provider);
    });
  });

  describe('getOAuthProviders', () => {
    it('should return available OAuth providers', () => {
      const expectedProviders = ['google', 'facebook'];

      const mockGetOAuthProviders =
        betterAuthService.getOAuthProviders as jest.MockedFunction<
          typeof betterAuthService.getOAuthProviders
        >;
      mockGetOAuthProviders.mockReturnValue(expectedProviders);

      const result = service.getOAuthProviders();

      expect(mockGetOAuthProviders).toHaveBeenCalled();
      expect(result).toEqual(expectedProviders);
    });
  });
});
