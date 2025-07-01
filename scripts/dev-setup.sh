#!/bin/bash

# Development Setup Script for NestJS GraphQL Starter
# This script sets up the development environment

set -e

echo "🚀 Setting up NestJS GraphQL Starter development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ bun is not installed. Installing bun..."
    curl -fsSL https://bun.sh/install | bash
    source ~/.bashrc
fi

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start database
echo "🐘 Starting PostgreSQL database..."
docker-compose up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🔄 Running database migrations..."
bun db:migrate

# Generate Prisma client
echo "🔧 Generating database client..."
bun db:generate

# Run tests
echo "🧪 Running tests..."
bun test

# Start development server
echo "🎯 Starting development server..."
echo "📝 Available commands:"
echo "  bun dev          - Start development server"
echo "  bun test         - Run tests"
echo "  bun test:e2e     - Run end-to-end tests"
echo "  bun lint         - Run linter"
echo "  bun lint:fix     - Fix linting issues"
echo "  bun db:migrate   - Run database migrations"
echo "  bun db:generate  - Generate database client"
echo "  bun db:seed      - Seed database"
echo ""
echo "✅ Development environment setup complete!"
echo "🌐 GraphQL Playground: http://localhost:3000/graphql"
echo "📊 Health Check: http://localhost:3000/health" 