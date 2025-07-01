import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecurityService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Get CORS configuration
   */
  getCorsConfig() {
    const allowedOrigins = this.configService.get<string>(
      'ALLOWED_ORIGINS',
      '*',
    );

    return {
      origin: allowedOrigins === '*' ? true : allowedOrigins.split(','),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-API-Key',
      ],
    };
  }

  /**
   * Get Helmet configuration
   */
  getHelmetConfig() {
    return {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false,
    };
  }

  /**
   * Validate API key
   */
  validateApiKey(apiKey: string): boolean {
    const validApiKey = this.configService.get<string>('API_KEY');
    return apiKey === validApiKey;
  }

  /**
   * Generate a secure random string
   */
  generateSecureToken(length = 32): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Sanitize user input
   */
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Check if request is from allowed origin
   */
  isAllowedOrigin(origin: string): boolean {
    const allowedOrigins = this.configService.get<string>(
      'ALLOWED_ORIGINS',
      '*',
    );

    if (allowedOrigins === '*') {
      return true;
    }

    const origins = allowedOrigins.split(',').map((o) => o.trim());
    return origins.includes(origin);
  }
}
