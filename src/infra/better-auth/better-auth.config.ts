import { ConfigService } from '@nestjs/config';

export interface BetterAuthConfig {
  database: {
    type: 'postgresql';
    url: string;
  };
  email: {
    from: string;
    transport: {
      host: string;
      port: number;
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
    };
  };
  session: {
    type: 'jwt';
    secret: string;
    expiresIn: string;
  };
  providers: {
    email: {
      enabled: boolean;
      requireEmailVerification: boolean;
    };
    google: {
      enabled: boolean;
      clientId: string;
      clientSecret: string;
    };
    facebook: {
      enabled: boolean;
      clientId: string;
      clientSecret: string;
    };
  };
  security: {
    bcryptRounds: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    passwordMinLength: number;
    requireStrongPassword: boolean;
  };
}

export function createBetterAuthConfig(
  configService: ConfigService,
): BetterAuthConfig {
  return {
    // Database configuration
    database: {
      type: 'postgresql',
      url:
        configService.get<string>('DATABASE_URL') ||
        'postgresql://postgres:postgres@localhost:5432/postgres',
    },

    // Session configuration
    session: {
      type: 'jwt',
      secret:
        configService.get<string>('JWT_SECRET') ||
        'your-secret-key-change-in-production',
      expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
    },

    // Email configuration
    email: {
      from: configService.get<string>('EMAIL_FROM') || 'noreply@example.com',
      transport: {
        host: configService.get<string>('SMTP_HOST') || 'localhost',
        port: configService.get<number>('SMTP_PORT') || 587,
        secure: configService.get<boolean>('SMTP_SECURE', false),
        auth: {
          user: configService.get<string>('SMTP_USER') || '',
          pass: configService.get<string>('SMTP_PASS') || '',
        },
      },
    },

    // OAuth providers
    providers: {
      email: {
        enabled: true,
        requireEmailVerification: configService.get<boolean>(
          'REQUIRE_EMAIL_VERIFICATION',
          false,
        ),
      },
      google: {
        enabled: configService.get<boolean>('GOOGLE_OAUTH_ENABLED', false),
        clientId: configService.get<string>('GOOGLE_CLIENT_ID') || '',
        clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      },
      facebook: {
        enabled: configService.get<boolean>('FACEBOOK_OAUTH_ENABLED', false),
        clientId: configService.get<string>('FACEBOOK_CLIENT_ID') || '',
        clientSecret: configService.get<string>('FACEBOOK_CLIENT_SECRET') || '',
      },
    },

    // Security settings
    security: {
      bcryptRounds: 12,
      maxLoginAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutes
      passwordMinLength: 8,
      requireStrongPassword: true,
    },
  };
}
