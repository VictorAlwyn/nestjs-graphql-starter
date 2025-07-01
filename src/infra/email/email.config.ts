import { ConfigService } from '@nestjs/config';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
  replyTo?: string;
}

export function getEmailConfig(configService: ConfigService): EmailConfig {
  return {
    host: configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
    port: parseInt(configService.get<string>('SMTP_PORT', '587'), 10),
    secure: configService.get<string>('SMTP_SECURE', 'false') === 'true',
    auth: {
      user: configService.get<string>('SMTP_USER', ''),
      pass: configService.get<string>('SMTP_PASS', ''),
    },
    from: configService.get<string>('EMAIL_FROM', 'noreply@example.com'),
    replyTo: configService.get<string>('EMAIL_REPLY_TO'),
  };
}
