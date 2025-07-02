import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';

import { extractGraphQLContext } from '../types/graphql.types';

interface ErrorResponse {
  message: string;
  code: string;
  timestamp: string;
  path: string | undefined;
  status?: number;
}

interface HttpExceptionResponse {
  message?: string;
  code?: string;
}

@Catch()
export class GraphQLExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GraphQLExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): ErrorResponse {
    const gqlHost = GqlArgumentsHost.create(host);
    const ctx = extractGraphQLContext(gqlHost.getContext());
    const req = ctx?.req;

    let errorResponse: ErrorResponse = {
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString(),
      path: req?.url,
    };

    if (exception instanceof HttpException) {
      const response = exception.getResponse() as HttpExceptionResponse;
      errorResponse = {
        ...errorResponse,
        message:
          typeof response === 'object' && response.message
            ? response.message
            : exception.message,
        code:
          typeof response === 'object' && response.code
            ? response.code
            : exception.name,
        status: exception.getStatus(),
      };
    } else if (exception instanceof Error) {
      errorResponse = {
        ...errorResponse,
        message: exception.message,
        code: exception.name,
      };
    }

    this.logger.error(
      `[GraphQL Error]`,
      exception instanceof Error ? exception.stack : String(exception),
    );
    return errorResponse;
  }
}
