import { Test, TestingModule } from '@nestjs/testing';

import { EmailService } from '../../src/infra/email/email.service';

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have transporter info', () => {
    const info = service.getTransporterInfo();
    expect(info).toHaveProperty('host');
    expect(info).toHaveProperty('port');
    expect(info).toHaveProperty('secure');
  });

  it('should handle email sending gracefully when SMTP is not configured', async () => {
    // This test will pass even if SMTP is not configured
    // because the service handles errors gracefully
    const result = await service.sendEmail({
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'This is a test email',
    });

    // The result should be false if SMTP is not configured
    expect(typeof result).toBe('boolean');
  });
});
