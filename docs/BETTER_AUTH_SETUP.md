# Better Auth Integration Guide

This guide explains how to set up and use Better Auth in your NestJS GraphQL application.

## 🚀 Quick Setup

Run the automated setup script:

```bash
bun better-auth:setup
```

This will:
- Add necessary environment variables to your `.env` file
- Start the database
- Generate and run migrations
- Set up Better Auth tables

## 📋 Environment Variables

### Required Variables

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/nestjs_graphql_db
```

### Optional Variables

```env
# Email Configuration
EMAIL_FROM=noreply@example.com
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password

# OAuth Providers
GOOGLE_OAUTH_ENABLED=true
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

FACEBOOK_OAUTH_ENABLED=true
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
REQUIRE_EMAIL_VERIFICATION=false
```

## 🔐 Authentication Features

### Email/Password Authentication

```graphql
# Login
mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user {
      id
      email
      name
      role
    }
  }
}

# Register
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    token
    user {
      id
      email
      name
      role
    }
  }
}

# Logout
mutation Logout {
  logout
}
```

### OAuth Authentication

```graphql
# Get OAuth URL
query GetOAuthUrl($provider: String!) {
  getOAuthUrl(provider: $provider)
}

# Get available providers
query GetOAuthProviders {
  getOAuthProviders
}

# Login with OAuth
mutation LoginWithOAuth($provider: String!, $code: String!) {
  loginWithOAuth(provider: $provider, code: $code) {
    token
    user {
      id
      email
      name
      role
    }
  }
}
```

### Password Reset

```graphql
# Request password reset
mutation RequestPasswordReset($input: RequestPasswordResetInput!) {
  requestPasswordReset(input: $input)
}

# Reset password
mutation ResetPassword($input: ResetPasswordInput!) {
  resetPassword(input: $input)
}
```

## 🛡️ Protected Routes

Use the `@UseGuards(BetterAuthGuard)` decorator to protect GraphQL resolvers:

```typescript
@Query(() => UserModel)
@UseGuards(BetterAuthGuard)
async me(@CurrentUser() user: UserModel): Promise<UserModel> {
  return user;
}
```

## 🔄 REST Endpoints

Better Auth also provides REST endpoints for OAuth flows:

- `GET /auth/oauth/:provider` - Get OAuth URL
- `POST /auth/oauth/:provider/callback` - Handle OAuth callback
- `GET /auth/oauth/providers` - Get available providers
- `POST /auth/login` - Email/password login
- `POST /auth/register` - Email/password registration
- `POST /auth/logout` - Logout
- `POST /auth/password-reset/request` - Request password reset
- `POST /auth/password-reset/reset` - Reset password

## 🔧 OAuth Provider Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set authorized redirect URIs:
   - `http://localhost:3000/auth/oauth/google/callback` (development)
   - `https://yourdomain.com/auth/oauth/google/callback` (production)
6. Copy Client ID and Client Secret to your `.env` file

### Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth redirect URIs:
   - `http://localhost:3000/auth/oauth/facebook/callback` (development)
   - `https://yourdomain.com/auth/oauth/facebook/callback` (production)
5. Copy App ID and App Secret to your `.env` file

## 📊 Database Schema

Better Auth creates the following tables:

- `better_auth_users` - User accounts
- `better_auth_sessions` - JWT sessions
- `better_auth_password_resets` - Password reset tokens
- `better_auth_oauth_accounts` - OAuth provider accounts

## 🔍 Audit Logging

All authentication events are automatically logged to the audit system:

- Login attempts (success/failure)
- Registration
- Logout
- Password resets
- OAuth logins

## 🚨 Security Considerations

1. **JWT Secret**: Use a strong, unique secret in production
2. **HTTPS**: Always use HTTPS in production
3. **OAuth Redirects**: Configure redirect URIs correctly
4. **Rate Limiting**: Better Auth includes built-in rate limiting
5. **Email Verification**: Enable email verification for production

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection**: Ensure PostgreSQL is running
2. **Environment Variables**: Check all required variables are set
3. **OAuth Redirects**: Verify redirect URIs match exactly
4. **SMTP Configuration**: Test email settings before enabling

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your `.env` file.

## 📚 Additional Resources

- [Better Auth Documentation](https://better-auth.com)
- [NestJS Authentication](https://docs.nestjs.com/security/authentication)
- [GraphQL Authentication](https://graphql.org/learn/authorization/)
- [OAuth 2.0 Specification](https://tools.ietf.org/html/rfc6749) 