# GitHub Actions Workflows

This project uses GitHub Actions for continuous integration, testing, and deployment. All workflows are configured to use **Bun** for faster builds and better performance.

## 🚀 Available Workflows

### 1. **Tests** (`.github/workflows/test.yml`)

**Triggers:** Push to `main`/`develop`, Pull Requests
**Purpose:** Comprehensive testing suite

**Features:**

- ✅ **Bun-based** - Uses Bun for faster dependency installation and execution
- 🗄️ **PostgreSQL & Redis** - Full database testing with real services
- 🧪 **Complete Test Suite** - Unit, integration, and E2E tests
- 📊 **Coverage Reports** - Uploads to Codecov and GitHub artifacts
- 🔒 **Security Audits** - Runs `bun audit` for vulnerability checks
- 🏗️ **Build Verification** - Ensures the application builds successfully

**Jobs:**

- `test` - Runs all tests with database services
- `security` - Security vulnerability scanning
- `build` - Application build verification

### 2. **CI** (`.github/workflows/ci.yml`)

**Triggers:** Push to `main`/`develop`, Pull Requests
**Purpose:** Fast feedback for developers

**Features:**

- ⚡ **Quick Feedback** - Optimized for speed
- 🗄️ **Database Services** - PostgreSQL and Redis containers
- 🧪 **Essential Tests** - Core functionality testing
- 🔒 **Security Checks** - Basic security audit
- 🏗️ **Build Check** - Ensures code compiles

### 3. **PR Check** (`.github/workflows/pr-check.yml`)

**Triggers:** Pull Requests to `main`/`develop`
**Purpose:** Automated PR feedback

**Features:**

- 🤖 **Auto Comments** - Posts results directly to PR
- ⚡ **Fast Execution** - Quick checks for immediate feedback
- 🧪 **Core Tests** - Unit and integration tests
- 🏗️ **Build Verification** - Ensures PR builds successfully

### 4. **Deploy** (`.github/workflows/deploy.yml`)

**Triggers:** Successful CI completion on `main`
**Purpose:** Production deployment

**Features:**

- 🚀 **Production Ready** - Deploys only after successful CI
- 📦 **Artifact Creation** - Creates deployment packages
- 🔄 **Rollback Support** - Automatic rollback on failure
- 📢 **Notifications** - Deployment status notifications

## 🛠️ Bun Configuration

All workflows use **Bun 1.0.35** for:

- **Faster Installation** - `bun install --frozen-lockfile`
- **Faster Execution** - `bun run` commands
- **Better Performance** - Optimized for modern JavaScript/TypeScript
- **Consistent Environment** - Same runtime across local and CI

### Key Bun Commands Used:

```bash
# Install dependencies
bun install --frozen-lockfile

# Run tests
bun run test:unit
bun run test:integration
bun run test:e2e
bun run test:all

# Database operations
bun run db:generate
bun run db:migrate

# Build and lint
bun run build
bun run lint

# Security
bun audit
```

## 🗄️ Database Services

All test workflows include:

- **PostgreSQL 15** (Alpine) - Port 5433
- **Redis 7** (Alpine) - Port 6380
- **Health Checks** - Ensures services are ready before tests
- **Test Database** - Isolated test environment

## 📊 Coverage and Artifacts

### Coverage Reports

- **Codecov Integration** - Automatic upload to Codecov
- **GitHub Artifacts** - Coverage reports stored for 30 days
- **LCOV Format** - Standard coverage format

### Build Artifacts

- **Dist Folder** - Compiled application
- **30-Day Retention** - Artifacts kept for 30 days
- **Downloadable** - Available for deployment or inspection

## 🔒 Security Features

### Security Audits

- **Bun Audit** - Native Bun security scanning
- **Vulnerability Levels** - Moderate and high severity checks
- **Automatic Blocking** - Fails CI on high-severity issues

### Environment Security

- **Test Secrets** - Isolated test environment variables
- **No Production Secrets** - Secure secret management
- **Environment Isolation** - Separate test and production configs

## 🚀 Performance Optimizations

### Bun Benefits

- **3x Faster** - Installation and execution speed
- **Memory Efficient** - Lower memory usage
- **Native TypeScript** - No compilation overhead
- **Better Caching** - Intelligent dependency caching

### Workflow Optimizations

- **Parallel Jobs** - Independent job execution
- **Caching** - Dependency and build caching
- **Service Health Checks** - Prevents flaky tests
- **Conditional Steps** - Only run necessary steps

## 📋 Usage Examples

### Local Development

```bash
# Run the same commands locally
bun install
bun run test:all
bun run build
```

### Manual Workflow Trigger

```bash
# Trigger workflows manually via GitHub UI
# Go to Actions tab → Select workflow → Run workflow
```

### Debugging Failed Workflows

1. **Check Logs** - Detailed step-by-step logs
2. **Download Artifacts** - Coverage reports and build artifacts
3. **Reproduce Locally** - Use same Bun version and commands
4. **Service Health** - Verify database and Redis connectivity

## 🔧 Customization

### Environment Variables

```yaml
env:
  BUN_VERSION: '1.0.35'
  POSTGRES_DB: test_db
  DATABASE_URL: postgresql://postgres:postgres@localhost:5433/test_db
  REDIS_URL: redis://localhost:6380
```

### Adding New Tests

1. **Create Test File** - Follow existing patterns
2. **Update Scripts** - Add to `package.json` scripts
3. **Update Workflows** - Include in appropriate workflow
4. **Test Locally** - Ensure tests pass with Bun

### Modifying Database Setup

1. **Update Schema** - Modify Drizzle configuration
2. **Update Migrations** - Add new migration files
3. **Update Workflows** - Include new migration steps
4. **Test Locally** - Verify with test database

## 🎯 Best Practices

### For Developers

- **Use Bun Locally** - Match CI environment
- **Test Before PR** - Run full test suite locally
- **Check Coverage** - Ensure adequate test coverage
- **Security First** - Run `bun audit` regularly

### For Maintainers

- **Monitor Performance** - Track workflow execution times
- **Update Dependencies** - Keep Bun and dependencies current
- **Review Security** - Monitor security audit results
- **Optimize Workflows** - Remove unnecessary steps

### For DevOps

- **Monitor Resources** - Track GitHub Actions minutes usage
- **Optimize Caching** - Maximize cache hit rates
- **Parallel Execution** - Use parallel jobs where possible
- **Artifact Management** - Clean up old artifacts regularly

## 📈 Metrics and Monitoring

### Key Metrics to Track

- **Workflow Duration** - Total execution time
- **Test Coverage** - Percentage of code covered
- **Security Issues** - Number of vulnerabilities found
- **Build Success Rate** - Percentage of successful builds
- **Deployment Frequency** - How often deployments occur

### Monitoring Tools

- **GitHub Actions** - Built-in workflow monitoring
- **Codecov** - Coverage tracking and reporting
- **GitHub Security** - Vulnerability scanning
- **Custom Dashboards** - Build your own metrics dashboard

## 🆘 Troubleshooting

### Common Issues

#### Tests Failing

```bash
# Check database connectivity
docker ps
docker exec postgres-test pg_isready -U postgres

# Check Redis connectivity
docker exec redis-test redis-cli ping

# Run tests locally
bun run test:all
```

#### Build Failures

```bash
# Check TypeScript compilation
bun run build

# Check for missing dependencies
bun install

# Verify Bun version
bun --version
```

#### Security Issues

```bash
# Run security audit
bun audit

# Update dependencies
bun update

# Check for known vulnerabilities
bun audit --level=high
```

### Getting Help

1. **Check Workflow Logs** - Detailed error information
2. **Reproduce Locally** - Use same environment
3. **Check Documentation** - Review this guide
4. **GitHub Issues** - Report bugs and request features

---

## 🎉 Success Metrics

When properly configured, you should see:

- ✅ **All tests passing** consistently
- ⚡ **Fast workflow execution** (< 10 minutes)
- 📊 **High test coverage** (> 80%)
- 🔒 **No security vulnerabilities**
- 🚀 **Successful deployments** to production

This setup provides a robust, fast, and reliable CI/CD pipeline using modern tools and best practices.
