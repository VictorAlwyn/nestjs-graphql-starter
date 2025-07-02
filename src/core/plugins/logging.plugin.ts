import { ApolloServerPlugin, GraphQLRequestListener } from '@apollo/server';
import { Plugin } from '@nestjs/apollo';

@Plugin()
export class LoggingPlugin implements ApolloServerPlugin {
  async requestDidStart(): Promise<
    GraphQLRequestListener<Record<string, unknown>>
  > {
    // Log request start (consider using a proper logger)
    // console.log('Request started');
    return {
      async willSendResponse() {
        // Log response (consider using a proper logger)
        // console.log('Will send response');
      },
    };
  }
}
