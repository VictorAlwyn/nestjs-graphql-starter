#!/bin/bash

# Test Runner Script
# This script sets up the test database and runs tests using Bun

set -e

echo "🧪 Running tests with Bun..."

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

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    print_error "Bun is not installed. Please install Bun and try again."
    exit 1
fi

# Parse command line arguments
TEST_TYPE=${1:-"all"}

case $TEST_TYPE in
    "unit")
        print_status "Running unit tests..."
        bun run test:unit
        ;;
    "integration")
        print_status "Running integration tests..."
        bun run test:integration
        ;;
    "e2e")
        print_status "Setting up test database..."
        ./scripts/setup-test-db.sh
        
        print_status "Running end-to-end tests..."
        bun run test:e2e
        ;;
    "all")
        print_status "Setting up test database..."
        ./scripts/setup-test-db.sh
        
        print_status "Running all tests..."
        bun run test:all
        ;;
    *)
        print_error "Invalid test type: $TEST_TYPE"
        print_status "Usage: ./scripts/run-tests.sh [unit|integration|e2e|all]"
        exit 1
        ;;
esac

print_status "✅ Tests completed!" 