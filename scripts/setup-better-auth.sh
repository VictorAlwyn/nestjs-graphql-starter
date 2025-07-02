#!/bin/bash

# Better Auth Setup Script for NestJS GraphQL Starter
echo "🔐 Setting up Better Auth for NestJS GraphQL Starter..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env 2>/dev/null || touch .env
fi

# Add Better Auth environment variables to .env
echo "🔧 Adding Better Auth environment variables to .env..."

# Check if variables already exist
if ! grep -q "JWT_SECRET" .env; then
    echo "" >> .env
    echo "# Better Auth Configuration" >> .env
    echo "JWT_SECRET=your-super-secret-jwt-key-change-this-in-production" >> .env
    echo "JWT_EXPIRES_IN=7d" >> .env
fi

if ! grep -q "EMAIL_FROM" .env; then
    echo "" >> .env
    echo "# Email Configuration for Better Auth" >> .env
    echo "EMAIL_FROM=noreply@example.com" >> .env
    echo "SMTP_HOST=localhost" >> .env
    echo "SMTP_PORT=587" >> .env
    echo "SMTP_SECURE=false" >> .env
    echo "SMTP_USER=" >> .env
    echo "SMTP_PASS=" >> .env
fi

if ! grep -q "GOOGLE_OAUTH_ENABLED" .env; then
    echo "" >> .env
    echo "# OAuth Configuration" >> .env
    echo "GOOGLE_OAUTH_ENABLED=false" >> .env
    echo "GOOGLE_CLIENT_ID=" >> .env
    echo "GOOGLE_CLIENT_SECRET=" >> .env
    echo "FACEBOOK_OAUTH_ENABLED=false" >> .env
    echo "FACEBOOK_CLIENT_ID=" >> .env
    echo "FACEBOOK_CLIENT_SECRET=" >> .env
fi

if ! grep -q "FRONTEND_URL" .env; then
    echo "" >> .env
    echo "# Frontend Configuration" >> .env
    echo "FRONTEND_URL=http://localhost:3000" >> .env
    echo "REQUIRE_EMAIL_VERIFICATION=false" >> .env
fi

# Start database if not running
echo "🗄️  Starting database..."
docker-compose up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Generate and run migrations
echo "🔄 Generating database migrations..."
bun db:generate

echo "📊 Running database migrations..."
bun db:migrate

echo "✅ Better Auth setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update your .env file with your actual configuration"
echo "2. For OAuth providers, set up your applications and add the credentials"
echo "3. For email functionality, configure your SMTP settings"
echo "4. Start the application with: bun start:dev"
echo ""
echo "🔗 Useful links:"
echo "- Better Auth Documentation: https://better-auth.com"
echo "- Google OAuth Setup: https://developers.google.com/identity/protocols/oauth2"
echo "- Facebook OAuth Setup: https://developers.facebook.com/docs/facebook-login"
echo ""
echo "🚀 Your NestJS GraphQL app is now using Better Auth!" 