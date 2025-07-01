import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EmailService } from '../../../infra/email/email.service';
import {
  WelcomeEmail,
  PasswordResetEmail,
} from '../../../infra/email/templates';

@Injectable()
export class AuthEmailService {
  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Send welcome email to newly registered user
   */
  async sendWelcomeEmail(
    userEmail: string,
    firstName: string,
    verificationToken?: string,
  ): Promise<boolean> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const verificationUrl =
      verificationToken && frontendUrl
        ? `${frontendUrl}/verify-email?token=${verificationToken}`
        : undefined;

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
    resetToken: string,
  ): Promise<boolean> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const resetUrl = frontendUrl
      ? `${frontendUrl}/reset-password?token=${resetToken}`
      : undefined;

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
   * Send email verification reminder
   */
  async sendVerificationReminder(
    userEmail: string,
    firstName: string,
    verificationToken: string,
  ): Promise<boolean> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const verificationUrl = frontendUrl
      ? `${frontendUrl}/verify-email?token=${verificationToken}`
      : undefined;

    const template = WelcomeEmail({
      userFirstName: firstName,
      userEmail: userEmail,
      verificationUrl: verificationUrl,
    });

    return await this.emailService.sendTemplateEmail(
      userEmail,
      'Please Verify Your Email Address',
      template,
    );
  }

  /**
   * Send account locked notification
   */
  async sendAccountLockedEmail(
    userEmail: string,
    firstName: string,
  ): Promise<boolean> {
    return await this.emailService.sendEmail({
      to: userEmail,
      subject: 'Account Temporarily Locked',
      html: `
        <h2>Hello ${firstName},</h2>
        <p>Your account has been temporarily locked due to multiple failed login attempts.</p>
        <p>Please contact support if you need assistance unlocking your account.</p>
        <p>Best regards,<br>The Team</p>
      `,
    });
  }

  /**
   * Send successful login notification (optional)
   */
  async sendLoginNotification(
    userEmail: string,
    firstName: string,
    loginTime: string,
    location?: string,
  ): Promise<boolean> {
    const locationText = location ? ` from ${location}` : '';

    return await this.emailService.sendEmail({
      to: userEmail,
      subject: 'New Login Detected',
      html: `
        <h2>Hello ${firstName},</h2>
        <p>We detected a new login to your account${locationText} at ${loginTime}.</p>
        <p>If this wasn't you, please contact support immediately.</p>
        <p>Best regards,<br>The Team</p>
      `,
    });
  }
}
