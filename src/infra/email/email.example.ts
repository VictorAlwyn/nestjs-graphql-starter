import { Injectable } from '@nestjs/common';

import { EmailService } from './email.service';
import { WelcomeEmail, PasswordResetEmail } from './templates';

@Injectable()
export class EmailExampleService {
  constructor(private readonly emailService: EmailService) {}

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(
    userEmail: string,
    firstName: string,
    verificationUrl?: string,
  ): Promise<boolean> {
    const template = WelcomeEmail({
      userFirstName: firstName,
      userEmail: userEmail,
      verificationUrl: verificationUrl,
    });

    return await this.emailService.sendTemplateEmail(
      userEmail,
      'Welcome to Our Platform!',
      template,
    );
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    userEmail: string,
    firstName: string,
    resetUrl: string,
  ): Promise<boolean> {
    const template = PasswordResetEmail({
      userFirstName: firstName,
      resetUrl: resetUrl,
      expiryTime: '1 hour',
    });

    return await this.emailService.sendTemplateEmail(
      userEmail,
      'Reset Your Password',
      template,
    );
  }

  /**
   * Send simple text email
   */
  async sendSimpleEmail(
    to: string,
    subject: string,
    message: string,
  ): Promise<boolean> {
    return await this.emailService.sendEmail({
      to,
      subject,
      text: message,
    });
  }

  /**
   * Send HTML email
   */
  async sendHtmlEmail(
    to: string,
    subject: string,
    htmlContent: string,
  ): Promise<boolean> {
    return await this.emailService.sendEmail({
      to,
      subject,
      html: htmlContent,
    });
  }

  /**
   * Send email to multiple recipients
   */
  async sendBulkEmail(
    recipients: string[],
    subject: string,
    message: string,
  ): Promise<boolean> {
    return await this.emailService.sendEmail({
      to: recipients,
      subject,
      text: message,
    });
  }

  /**
   * Send email with CC and BCC
   */
  async sendEmailWithCC(
    to: string,
    cc: string[],
    bcc: string[],
    subject: string,
    message: string,
  ): Promise<boolean> {
    return await this.emailService.sendEmail({
      to,
      cc,
      bcc,
      subject,
      text: message,
    });
  }

  /**
   * Verify email service connection
   */
  async verifyEmailConnection(): Promise<boolean> {
    return await this.emailService.verifyConnection();
  }

  /**
   * Get email service info
   */
  getEmailServiceInfo(): { host: string; port: number; secure: boolean } {
    return this.emailService.getTransporterInfo();
  }
}
