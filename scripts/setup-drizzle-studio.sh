#!/bin/bash

# Setup Drizzle Studio Script
# This script helps set up Drizzle Studio for database management

set -e

echo "🔧 Setting up Drizzle Studio..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
NODE_ENV=development

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres

# --- SMTP ---
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=23fe7b625aff91
SMTP_PASS=623c46e338026e
EMAIL_FROM="My App <noreply@example.com>"
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start PostgreSQL if not running
echo "🐘 Starting PostgreSQL database..."
docker-compose up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Test database connection
echo "🔍 Testing database connection..."
if bun db:migrate; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed. Please check your .env file and Docker setup."
    exit 1
fi

# Generate schema
echo "🔧 Generating database schema..."
bun db:generate

echo ""
echo "🎉 Drizzle Studio setup complete!"
echo ""
echo "📋 To start Drizzle Studio, run:"
echo "   bun db:studio"
echo ""
echo "🌐 Drizzle Studio will open at: http://localhost:4983"
echo ""
echo "📊 Your database tables:"
echo "   - users"
echo "   - audit_logs"
echo ""
echo "💡 If Drizzle Studio is still loading:"
echo "   1. Make sure PostgreSQL is running: docker-compose ps"
echo "   2. Check your DATABASE_URL in .env"
echo "   3. Try refreshing the browser"
echo "   4. Check the console for any error messages" 