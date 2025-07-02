import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { ValidationError } from 'class-validator';

interface ValidationErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  correlationId: string;
  validationErrors?: ValidationErrorDetail[];
}

interface ValidationErrorDetail {
  field: string;
  value: unknown;
  constraints: Record<string, string>;
  children?: ValidationErrorDetail[];
}

/**
 * Specialized exception filter for validation errors
 * Provides detailed validation error information in development
 * and sanitized errors in production
 */
@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);
  private readonly configService = new ConfigService();

  catch(exception: BadRequestException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const isProduction = this.configService.get('env') === 'production';
    const correlationId = this.generateCorrelationId();

    // Add correlation ID to response headers
    response.setHeader('X-Correlation-ID', correlationId);

    // Log the validation error
    this.logValidationError(exception, correlationId, request);

    // Get validation errors from the exception
    const validationErrors = this.extractValidationErrors(exception);

    // Create error response
    const errorResponse: ValidationErrorResponse = {
      statusCode: exception.getStatus(),
      message: isProduction 
        ? 'Validation failed' 
        : 'Validation failed. Please check your input.',
      error: 'Bad Request',
      timestamp: new Date().toISOString(),
      path: request.url,
      correlationId,
    };

    // Add detailed validation errors only in development
    if (!isProduction && validationErrors.length > 0) {
      errorResponse.validationErrors = validationErrors;
    }

    response.status(exception.getStatus()).json(errorResponse);
  }

  private extractValidationErrors(exception: BadRequestException): ValidationErrorDetail[] {
    const response = exception.getResponse();
    
    if (typeof response === 'object' && response !== null) {
      const responseObj = response as any;
      
      // Check if it's a validation error from class-validator
      if (Array.isArray(responseObj.message)) {
        return responseObj.message
          .filter((error: any) => this.isValidationError(error))
          .map((error: ValidationError) => this.transformValidationError(error));
      }
    }

    return [];
  }

  private isValidationError(error: any): error is ValidationError {
    return (
      error &&
      typeof error === 'object' &&
      'property' in error &&
      'constraints' in error
    );
  }

  private transformValidationError(error: ValidationError): ValidationErrorDetail {
    const detail: ValidationErrorDetail = {
      field: error.property,
      value: error.value,
      constraints: error.constraints || {},
    };

    // Handle nested validation errors
    if (error.children && error.children.length > 0) {
      detail.children = error.children.map(child => 
        this.transformValidationError(child)
      );
    }

    return detail;
  }

  private logValidationError(
    exception: BadRequestException,
    correlationId: string,
    request: Request,
  ): void {
    const validationErrors = this.extractValidationErrors(exception);
    
    this.logger.warn(
      `[Validation Error] ${exception.message}`,
      {
        correlationId,
        method: request.method,
        url: request.url,
        userAgent: request.headers['user-agent'],
        ip: request.ip,
        userId: (request as any).user?.id,
        validationErrors: validationErrors.map(error => ({
          field: error.field,
          constraints: Object.keys(error.constraints),
        })),
      },
    );
  }

  private generateCorrelationId(): string {
    return `val_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}
