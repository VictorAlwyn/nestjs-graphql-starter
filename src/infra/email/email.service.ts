import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { render } from '@react-email/render';
import * as nodemailer from 'nodemailer';
import { ReactElement } from 'react';

import { AppLoggerService } from '../../core/logger/logger.service';

import { EmailConfig, getEmailConfig } from './email.config';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

@Injectable()
export class EmailService {
  private readonly logger = new AppLoggerService('EmailService');
  private transporter: nodemailer.Transporter;
  private readonly config: EmailConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = getEmailConfig(this.configService);
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    try {
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: this.config.auth,
      });

      this.logger.log(
        `Email transporter initialized for ${this.config.host}:${this.config.port}`,
      );
    } catch (error) {
      this.logger.error(
        'Failed to initialize email transporter',
        error instanceof Error ? error.stack : 'Unknown error',
      );
      throw error;
    }
  }

  /**
   * Send a simple email with HTML or text content
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.config.from,
        to: Array.isArray(options.to) ? options.to.join(',') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        cc: options.cc
          ? Array.isArray(options.cc)
            ? options.cc.join(',')
            : options.cc
          : undefined,
        bcc: options.bcc
          ? Array.isArray(options.bcc)
            ? options.bcc.join(',')
            : options.bcc
          : undefined,
        replyTo: this.config.replyTo,
      };

      const result = await this.transporter.sendMail(mailOptions);

      const recipient = Array.isArray(options.to)
        ? options.to.join(', ')
        : options.to;
      this.logger.log(
        `Email sent successfully to ${recipient}`,
        'EmailService',
      );
      this.logger.debug(
        `Message ID: ${result.messageId || 'unknown'}`,
        'EmailService',
      );

      return true;
    } catch (error) {
      const recipient = Array.isArray(options.to)
        ? options.to.join(', ')
        : options.to;
      this.logger.error(
        `Failed to send email to ${recipient}`,
        error instanceof Error ? error.stack : 'Unknown error',
      );
      return false;
    }
  }

  /**
   * Send email using React Email template
   */
  async sendTemplateEmail(
    to: string | string[],
    subject: string,
    template: ReactElement,
  ): Promise<boolean> {
    try {
      const html = await render(template);

      return await this.sendEmail({
        to,
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(
        'Failed to render email template',
        error instanceof Error ? error.stack : 'Unknown error',
      );
      return false;
    }
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      this.logger.error(
        'SMTP connection verification failed',
        error instanceof Error ? error.stack : 'Unknown error',
      );
      return false;
    }
  }

  /**
   * Get transporter info
   */
  getTransporterInfo(): { host: string; port: number; secure: boolean } {
    return {
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
    };
  }
}
