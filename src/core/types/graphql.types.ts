import { BetterAuthSessionResponse } from '../../infra/better-auth/better-auth.service';
import { BetterAuthUser } from '../../infra/database/schemas/better-auth.schema';

/**
 * GraphQL Request interface representing the request object in GraphQL context
 */
export interface GraphQLRequest {
  user?: BetterAuthUser;
  session?: BetterAuthSessionResponse;
  ip?: string;
  connection?: {
    remoteAddress?: string;
  };
  headers?: Record<string, string>;
  body?: {
    variables?: Record<string, unknown>;
  };
  url?: string;
}

/**
 * GraphQL Context interface representing the context object in GraphQL resolvers
 */
export interface GraphQLContext {
  req?: GraphQLRequest;
}

/**
 * GraphQL Info interface representing the info object in GraphQL resolvers
 */
export interface GraphQLInfo {
  operation?: {
    name?: {
      value?: string;
    };
    operation?: string;
  };
}

/**
 * Type guard to check if an object is a GraphQLContext
 */
export function isGraphQLContext(obj: unknown): obj is GraphQLContext {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    ('req' in obj || Object.keys(obj).length === 0)
  );
}

/**
 * Type guard to check if an object is a GraphQLRequest
 */
export function isGraphQLRequest(obj: unknown): obj is GraphQLRequest {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    ('user' in obj ||
      'headers' in obj ||
      'ip' in obj ||
      Object.keys(obj).length === 0)
  );
}

/**
 * Safely extract GraphQL context from unknown context
 */
export function extractGraphQLContext(ctx: unknown): GraphQLContext {
  if (isGraphQLContext(ctx)) {
    return ctx;
  }
  return {};
}

/**
 * Safely extract GraphQL request from unknown request
 */
export function extractGraphQLRequest(req: unknown): GraphQLRequest {
  if (isGraphQLRequest(req)) {
    return req;
  }
  return {};
}

/**
 * Safely extract GraphQL info from unknown info
 */
export function extractGraphQLInfo(info: unknown): GraphQLInfo {
  if (typeof info === 'object' && info !== null) {
    return info as GraphQLInfo;
  }
  return {};
}
