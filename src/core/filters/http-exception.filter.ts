import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

interface HttpErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
  correlationId: string;
  details?: unknown;
}

interface HttpExceptionResponse {
  message?: string | string[];
  code?: string;
  error?: string;
}

/**
 * Global HTTP exception filter for REST endpoints
 * Provides consistent error formatting, logging, and security considerations
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  private readonly configService = new ConfigService();

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const isProduction = this.configService.get('env') === 'production';
    const correlationId = this.generateCorrelationId();

    // Add correlation ID to response headers
    response.setHeader('X-Correlation-ID', correlationId);

    // Log the error with correlation ID
    this.logError(exception, correlationId, request);

    // Determine error details
    const errorDetails = this.getErrorDetails(exception, isProduction);

    // Create error response
    const errorResponse: HttpErrorResponse = {
      statusCode: errorDetails.status,
      message: errorDetails.message,
      error: errorDetails.error,
      timestamp: new Date().toISOString(),
      path: request.url,
      correlationId,
    };

    // Add details only in development
    if (!isProduction && errorDetails.details) {
      errorResponse.details = errorDetails.details;
    }

    response.status(errorDetails.status).json(errorResponse);
  }

  private getErrorDetails(exception: unknown, isProduction: boolean) {
    if (exception instanceof HttpException) {
      const response = exception.getResponse() as HttpExceptionResponse;
      const message = this.extractMessage(response, exception.message);
      
      return {
        status: exception.getStatus(),
        message: isProduction ? this.sanitizeErrorMessage(message) : message,
        error: this.getErrorName(exception),
        details: isProduction ? undefined : response,
      };
    }

    if (exception instanceof Error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: isProduction ? 'Internal server error' : exception.message,
        error: 'Internal Server Error',
        details: isProduction ? undefined : {
          name: exception.name,
          stack: exception.stack,
        },
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Unknown error occurred',
      error: 'Internal Server Error',
      details: isProduction ? undefined : String(exception),
    };
  }

  private extractMessage(response: HttpExceptionResponse, fallback: string): string {
    if (typeof response === 'object' && response.message) {
      if (Array.isArray(response.message)) {
        return response.message.join(', ');
      }
      return response.message;
    }
    return fallback;
  }

  private getErrorName(exception: HttpException): string {
    const response = exception.getResponse() as HttpExceptionResponse;
    
    if (typeof response === 'object' && response.error) {
      return response.error;
    }

    // Map common HTTP exceptions to error names
    switch (exception.constructor) {
      case BadRequestException:
        return 'Bad Request';
      case UnauthorizedException:
        return 'Unauthorized';
      case ForbiddenException:
        return 'Forbidden';
      case NotFoundException:
        return 'Not Found';
      case ConflictException:
        return 'Conflict';
      case InternalServerErrorException:
        return 'Internal Server Error';
      default:
        return exception.name.replace(/Exception$/, '');
    }
  }

  private sanitizeErrorMessage(message: string | string[]): string | string[] {
    const sanitizeString = (str: string): string => {
      // Remove sensitive information from error messages in production
      const sensitivePatterns = [
        /password/gi,
        /token/gi,
        /secret/gi,
        /key/gi,
        /credential/gi,
        /authorization/gi,
      ];

      let sanitized = str;
      sensitivePatterns.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '[REDACTED]');
      });

      return sanitized;
    };

    if (Array.isArray(message)) {
      return message.map(sanitizeString);
    }

    return sanitizeString(message);
  }

  private logError(exception: unknown, correlationId: string, request: Request): void {
    const errorInfo = {
      correlationId,
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      userId: (request as any).user?.id, // If user is attached to request
    };

    if (exception instanceof HttpException) {
      const level = exception.getStatus() >= 500 ? 'error' : 'warn';
      this.logger[level](
        `[HTTP ${exception.getStatus()}] ${exception.message}`,
        {
          ...errorInfo,
          status: exception.getStatus(),
          response: exception.getResponse(),
        },
      );
    } else if (exception instanceof Error) {
      this.logger.error(
        `[HTTP Error] ${exception.message}`,
        {
          ...errorInfo,
          stack: exception.stack,
          name: exception.name,
        },
      );
    } else {
      this.logger.error(
        `[HTTP Unknown Error] ${String(exception)}`,
        errorInfo,
      );
    }
  }

  private generateCorrelationId(): string {
    return `http_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}
