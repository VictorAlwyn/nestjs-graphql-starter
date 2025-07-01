import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

interface EmailJobData {
  to: string;
  subject: string;
  body?: string;
  html?: string;
  from?: string;
}

interface EmailJobResult {
  success: boolean;
  recipient: string;
  subject: string;
  sentAt: string;
  jobId: string;
}

@Injectable()
export class EmailQueueWorker {
  private readonly logger = new Logger(EmailQueueWorker.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    const authUser = this.config.get<string>('SMTP_USER');
    const authPass = this.config.get<string>('SMTP_PASS');

    if (!authUser || !authPass) {
      this.logger.warn(
        'SMTP_USER / SMTP_PASS are not set – emails will not be sent',
      );
    }

    const auth =
      authUser && authPass ? { user: authUser, pass: authPass } : undefined;

    const host = this.config.get<string>('SMTP_HOST');
    if (!host) {
      throw new Error(
        'SMTP_HOST environment variable is required for EmailQueueWorker',
      );
    }

    const port = Number(this.config.get<string>('SMTP_PORT') || 587);
    const secure = this.config.get<string>('SMTP_SECURE') === 'true';

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth,
    });
  }

  async processEmailJob(job: any): Promise<EmailJobResult> {
    try {
      const jobData: EmailJobData = job?.data || {};
      const { to, subject, html, body, from } = jobData;

      if (!to) {
        throw new Error(
          'Email recipient (to) is required but was not provided',
        );
      }

      if (!subject) {
        throw new Error('Email subject is required but was not provided');
      }

      this.logger.log(`Processing email job for: ${to}`, {
        jobId: job?.id || 'unknown-id',
        subject: subject,
      });

      const content = html || body || '';

      await this.transporter.sendMail({
        from:
          from ||
          this.config.get<string>('EMAIL_FROM') ||
          'no-reply@example.com',
        to,
        subject,
        html: content,
      });

      const result: EmailJobResult = {
        success: true,
        recipient: to,
        subject: subject,
        sentAt: new Date().toISOString(),
        jobId: job?.id || 'unknown',
      };

      this.logger.log(`Email sent successfully to: ${to}`, {
        jobId: job?.id || 'unknown-id',
        sentAt: result.sentAt,
      });

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send email to: ${job?.data?.to || 'unknown'}`,
        {
          jobId: job?.id || 'unknown-id',
          message: error.message,
          recipient: job?.data?.to,
          subject: job?.data?.subject,
        },
      );
      throw error;
    }
  }
}
