import { Controller, Post, Req, Res, Body, Param } from '@nestjs/common';
import { Response } from 'express';

import { Audit } from '../../core/decorators/audit.decorator';
import { BetterAuthService } from '../../infra/better-auth/better-auth.service';
import { AuditLogAction } from '../../infra/database/schemas/audit-logs.schema';

export interface OAuthCallbackInput {
  code: string;
  state?: string;
}

@Controller('auth')
export class OAuthController {
  constructor(private readonly betterAuthService: BetterAuthService) {}

  /**
   * Handle OAuth callback - This is the only REST endpoint we need
   * because OAuth providers require redirects which don't work with GraphQL
   */
  @Post('oauth/:provider/callback')
  @Audit({ action: AuditLogAction.LOGIN, resource: 'oauth' })
  async handleOAuthCallback(
    @Param('provider') provider: string,
    @Body() body: OAuthCallbackInput,
    @Req() req: any,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const session = await this.betterAuthService.loginWithOAuth(
        provider,
        body.code,
        req,
      );

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/auth/callback?token=${session.token}&provider=${provider}`;

      res.redirect(redirectUrl);
    } catch (_error) {
      // Redirect to frontend with error
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/auth/error?error=oauth_failed&provider=${provider}`;

      res.redirect(redirectUrl);
    }
  }
}
