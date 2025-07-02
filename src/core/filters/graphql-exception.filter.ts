import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

import { extractGraphQLContext } from '../types/graphql.types';

interface HttpExceptionResponse {
  message?: string | string[];
  code?: string;
  error?: string;
}

interface GraphQLErrorExtensions extends Record<string, unknown> {
  code: string;
  status: number;
  timestamp: string;
  correlationId?: string;
  details?: unknown;
}

@Catch()
export class GraphQLExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GraphQLExceptionFilter.name);
  private readonly configService = new ConfigService();

  catch(exception: unknown, host: ArgumentsHost): GraphQLError {
    const gqlHost = GqlArgumentsHost.create(host);
    const ctx = extractGraphQLContext(gqlHost.getContext());
    const req = ctx?.req;
    const isProduction = this.configService.get('env') === 'production';
    const correlationId = this.generateCorrelationId();

    // Log the error with correlation ID
    this.logError(exception, correlationId, req);

    // Determine error details
    const errorDetails = this.getErrorDetails(exception, isProduction);

    // Create GraphQL error with extensions
    const extensions: GraphQLErrorExtensions = {
      code: errorDetails.code,
      status: errorDetails.status,
      timestamp: new Date().toISOString(),
      correlationId,
    };

    // Add details only in development
    if (!isProduction && errorDetails.details) {
      extensions.details = errorDetails.details;
    }

    return new GraphQLError(errorDetails.message, {
      extensions,
    });
  }

  private getErrorDetails(exception: unknown, isProduction: boolean) {
    if (exception instanceof HttpException) {
      const response = exception.getResponse() as HttpExceptionResponse;
      const message = this.extractMessage(response, exception.message);

      return {
        message: isProduction ? this.sanitizeErrorMessage(message) : message,
        code: this.getErrorCode(exception),
        status: exception.getStatus(),
        details: isProduction ? undefined : response,
      };
    }

    if (exception instanceof GraphQLError) {
      return {
        message: isProduction ? 'GraphQL error occurred' : exception.message,
        code: 'GRAPHQL_ERROR',
        status: 400,
        details: isProduction ? undefined : exception.extensions,
      };
    }

    if (exception instanceof Error) {
      return {
        message: isProduction ? 'Internal server error' : exception.message,
        code: 'INTERNAL_ERROR',
        status: 500,
        details: isProduction
          ? undefined
          : { name: exception.name, stack: exception.stack },
      };
    }

    return {
      message: 'Unknown error occurred',
      code: 'UNKNOWN_ERROR',
      status: 500,
      details: isProduction ? undefined : String(exception),
    };
  }

  private extractMessage(
    response: HttpExceptionResponse,
    fallback: string,
  ): string {
    if (typeof response === 'object' && response.message) {
      if (Array.isArray(response.message)) {
        return response.message.join(', ');
      }
      return response.message;
    }
    return fallback;
  }

  private getErrorCode(exception: HttpException): string {
    const response = exception.getResponse() as HttpExceptionResponse;

    if (typeof response === 'object' && response.code) {
      return response.code;
    }

    // Map common HTTP exceptions to codes
    switch (exception.constructor) {
      case BadRequestException:
        return 'BAD_REQUEST';
      case UnauthorizedException:
        return 'UNAUTHORIZED';
      case ForbiddenException:
        return 'FORBIDDEN';
      case NotFoundException:
        return 'NOT_FOUND';
      case ConflictException:
        return 'CONFLICT';
      case InternalServerErrorException:
        return 'INTERNAL_SERVER_ERROR';
      default:
        return exception.name.replace(/Exception$/, '').toUpperCase();
    }
  }

  private sanitizeErrorMessage(message: string): string {
    // Remove sensitive information from error messages in production
    const sensitivePatterns = [
      /password/gi,
      /token/gi,
      /secret/gi,
      /key/gi,
      /credential/gi,
    ];

    let sanitized = message;
    sensitivePatterns.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });

    return sanitized;
  }

  private logError(
    exception: unknown,
    correlationId: string,
    req?: unknown,
  ): void {
    const errorInfo = {
      correlationId,
      url: req && typeof req === 'object' && 'url' in req ? req.url : undefined,
      userAgent:
        req && typeof req === 'object' && 'headers' in req
          ? (req.headers as Record<string, unknown>)?.['user-agent']
          : undefined,
    };

    if (exception instanceof HttpException) {
      this.logger.error(`[GraphQL HTTP Exception] ${exception.message}`, {
        ...errorInfo,
        status: exception.getStatus(),
        response: exception.getResponse(),
      });
    } else if (exception instanceof Error) {
      this.logger.error(`[GraphQL Error] ${exception.message}`, {
        ...errorInfo,
        stack: exception.stack,
        name: exception.name,
      });
    } else {
      this.logger.error(
        `[GraphQL Unknown Error] ${String(exception)}`,
        errorInfo,
      );
    }
  }

  private generateCorrelationId(): string {
    return `gql_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}
