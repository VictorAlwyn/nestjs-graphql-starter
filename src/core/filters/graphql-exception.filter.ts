import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';

@Catch()
export class GraphQLExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GraphQLExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const ctx = gqlHost.getContext();
    const req = ctx?.req;

    let errorResponse: {
      message: string;
      code: string;
      timestamp: string;
      path: string | undefined;
      status?: number;
    } = {
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString(),
      path: req?.url,
    };

    if (exception instanceof HttpException) {
      const response = exception.getResponse() as any;
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
