# NestJS GraphQL Starter

A production-ready NestJS GraphQL starter with comprehensive features including authentication, email services, queue management, health checks, and more.

## 🚀 Features

### Core Features
- **GraphQL API** with Apollo Server
- **Authentication & Authorization** with JWT and role-based access
- **Database Integration** with Drizzle ORM and PostgreSQL
- **Email Service** with Nodemailer and React Email templates
- **Queue Management** with pg-boss for background jobs
- **Cron Jobs** with NestJS Schedule
- **Health Checks** with comprehensive monitoring endpoints
- **Logging** with Winston and structured logging
- **Security** with rate limiting, CORS, and input sanitization
- **Type Safety** with TypeScript and Zod validation

### Developer Experience
- **ESLint** with import sorting and code quality rules
- **Prettier** for consistent code formatting
- **Husky** pre-commit hooks for quality assurance
- **Comprehensive testing** setup with Jest
- **Development scripts** for easy setup and management
- **Docker** support for database and services

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Docker and Docker Compose
- PostgreSQL (via Docker)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nestjs-graphql-starter
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development environment**
   ```bash
   pnpm dev:setup
   ```

## 🏃‍♂️ Quick Start

### Development
```bash
# Start development server
pnpm start:dev

# Run tests
pnpm test

# Run linting
pnpm lint

# Check types
pnpm tsc --noEmit
```

### Database
```bash
# Generate database client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Open database studio
pnpm db:studio

# Reset database
pnpm dev:reset
```

### Docker
```bash
# Start services
pnpm docker:up

# View logs
pnpm docker:logs

# Stop services
pnpm docker:down
```

## 📁 Project Structure

```
src/
├── config/                 # Environment configuration
├── core/                   # Core application modules
│   ├── decorators/        # Custom decorators
│   ├── directives/        # GraphQL directives
│   ├── filters/           # Exception filters
│   ├── graphql.module.ts  # GraphQL configuration
│   ├── logger/            # Winston logging setup
│   ├── plugins/           # GraphQL plugins
│   ├── scalars/           # Custom GraphQL scalars
│   └── security/          # Security configurations
├── infra/                 # Infrastructure modules
│   ├── cron/              # Cron job management
│   ├── database/          # Database configuration
│   ├── email/             # Email service
│   ├── health/            # Health check endpoints
│   ├── jwt/               # JWT authentication
│   ├── pg-boss/           # Queue management
│   └── queue/             # Queue workers
└── modules/               # Business logic modules
    ├── auth/              # Authentication module
    └── recipes/           # Example business module
```

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Security
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
API_KEY=your-api-key

# Queue
PG_BOSS_DATABASE_URL=postgresql://user:password@localhost:5432/pg_boss
```

## 🏥 Health Checks

The application provides comprehensive health check endpoints:

- `GET /health` - Full health check
- `GET /health/readiness` - Readiness probe
- `GET /health/liveness` - Liveness probe
- `GET /health/detailed` - Detailed health information
- `GET /health/metrics` - Application metrics

## 📧 Email Service

The email service supports:

- **SMTP Configuration** with Nodemailer
- **React Email Templates** for beautiful emails
- **Template Rendering** with dynamic data
- **Queue Integration** for background processing
- **Connection Verification** for health checks

### Example Usage

```typescript
// Send simple email
await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<h1>Welcome to our platform</h1>'
});

// Send template email
await emailService.sendTemplateEmail(
  'user@example.com',
  'Welcome Email',
  WelcomeEmailTemplate({ userFirstName: 'John' })
);
```

## 🔄 Queue Management

The queue system provides:

- **Type-safe Job Payloads** with TypeScript interfaces
- **Background Processing** with pg-boss
- **Multiple Queue Types** (email, health-check, cleanup, etc.)
- **Job Monitoring** and status tracking
- **Error Handling** and retry mechanisms

### Example Usage

```typescript
// Add email job to queue
await queueService.addEmailJob({
  to: 'user@example.com',
  subject: 'Welcome!',
  body: 'Welcome to our platform'
});

// Add custom job
await queueService.addJob('custom-queue', {
  type: 'custom-task',
  scheduledAt: new Date().toISOString(),
  data: { /* job data */ }
});
```

## 🕐 Cron Jobs

The cron system provides:

- **Scheduled Tasks** with NestJS Schedule
- **Queue Integration** for background processing
- **Health Check Scheduling** every 6 hours
- **Daily Cleanup** tasks
- **Monthly Reports** generation

## 🔐 Security Features

- **JWT Authentication** with passport
- **Role-based Authorization** with guards
- **Rate Limiting** with ThrottlerModule
- **CORS Configuration** with security headers
- **Input Sanitization** to prevent XSS
- **API Key Validation** for external services

## 🧪 Testing

### Test Structure
```
test/
├── setup/                 # Test configuration
├── auth/                  # Authentication tests
├── email/                 # Email service tests
└── app.e2e-spec.ts        # End-to-end tests
```

### Running Tests
```bash
# Unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:cov

# End-to-end tests
pnpm test:e2e
```

## 📊 Monitoring & Logging

### Logging
- **Structured Logging** with Winston
- **Multiple Transports** (console, file)
- **Environment-aware** formatting
- **Custom Log Methods** for different contexts

### Monitoring
- **Health Check Endpoints** for Kubernetes
- **Application Metrics** collection
- **Queue Status** monitoring
- **Database Connection** health

## 🚀 Deployment

### Production Build
```bash
# Build the application
pnpm build

# Start production server
pnpm start:prod
```

### Docker Deployment
```bash
# Build Docker image
docker build -t nestjs-graphql-starter .

# Run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

## 📝 Available Scripts

### Development
- `pnpm dev:setup` - Complete development setup
- `pnpm dev:reset` - Reset database and regenerate
- `pnpm dev:clean` - Clean build artifacts
- `pnpm dev:full` - Full reset and setup

### Database
- `pnpm db:generate` - Generate database client
- `pnpm db:migrate` - Run migrations
- `pnpm db:studio` - Open database studio
- `pnpm db:drop` - Drop database

### Health & Monitoring
- `pnpm health:check` - Check application health
- `pnpm queue:status` - Check queue status

### Docker
- `pnpm docker:up` - Start Docker services
- `pnpm docker:down` - Stop Docker services
- `pnpm docker:logs` - View Docker logs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the example code

---

**Happy Coding! 🎉**
