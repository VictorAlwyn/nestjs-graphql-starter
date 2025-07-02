#!/bin/bash

# Test Database Setup Script
# This script sets up the test database for running tests using Drizzle and Bun

set -e

echo "🚀 Setting up test database..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    print_error "Bun is not installed. Please install Bun and try again."
    exit 1
fi

# Stop any existing test containers
print_status "Stopping existing test containers..."
docker-compose -f docker-compose.test.yml down -v 2>/dev/null || true

# Start test database
print_status "Starting test database..."
docker-compose -f docker-compose.test.yml up -d

# Wait for database to be ready
print_status "Waiting for database to be ready..."
sleep 5

# Check if database is accessible
print_status "Checking database connectivity..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if docker exec postgres-test pg_isready -U postgres -d test_db > /dev/null 2>&1; then
        print_status "Database is ready!"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        print_error "Database failed to start within expected time"
        exit 1
    fi
    
    print_warning "Database not ready yet, attempt $attempt/$max_attempts"
    sleep 2
    attempt=$((attempt + 1))
done

# Set test environment variables
export NODE_ENV=test
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/test_db
export REDIS_URL=redis://localhost:6380

# Generate Drizzle schema for test database
print_status "Generating Drizzle schema for test database..."
bun run db:generate:test

# Push schema to test database
print_status "Pushing schema to test database..."
bun run db:push:test

print_status "✅ Test database setup complete!"
print_status "You can now run: bun run test:e2e"
print_status ""
print_status "📋 Test commands:"
print_status "  bun run test:unit      - Run unit tests"
print_status "  bun run test:integration - Run integration tests"
print_status "  bun run test:e2e       - Run end-to-end tests"
print_status "  bun run test:all       - Run all tests"
print_status "  bun run test:full      - Setup, run all tests, and teardown"
print_status ""
print_status "🗄️  Test database: postgresql://postgres:postgres@localhost:5432/test_db"
print_status "🔴 Test Redis: redis://localhost:6380" 