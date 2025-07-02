# GitHub Actions Workflows

This document describes the GitHub Actions workflows set up for the NestJS GraphQL application.

## 📋 Workflow Overview

We have three main workflows:

1. **CI** (`.github/workflows/ci.yml`) - Main continuous integration
2. **PR Check** (`.github/workflows/pr-check.yml`) - Pull request validation
3. **Deploy** (`.github/workflows/deploy.yml`) - Production deployment

## 🚀 CI Workflow

### Triggers

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

### Jobs

#### 1. Test Suite

- **Purpose**: Run all tests with database and Redis services
- **Services**: PostgreSQL (port 5433) and Redis (port 6380)
- **Steps**:
  - Setup Node.js 18
  - Install dependencies with caching
  - Create test environment file
  - Wait for database services
  - Setup database schema and migrations
  - Run linting
  - Run all tests (`npm run test:all`)
  - Upload coverage reports

#### 2. Security Audit

- **Purpose**: Check for security vulnerabilities
- **Dependencies**: Runs after test suite passes
- **Steps**:
  - Run `npm audit --audit-level=moderate`
  - Check for high-level vulnerabilities

#### 3. Build

- **Purpose**: Ensure application builds successfully
- **Dependencies**: Runs after test suite passes
- **Steps**:
  - Build application (`npm run build`)
  - Upload build artifacts

### Environment Variables

```yaml
NODE_VERSION: '18'
POSTGRES_DB: test_db
POSTGRES_USER: postgres
POSTGRES_PASSWORD: postgres
DATABASE_URL: postgresql://postgres:postgres@localhost:5433/test_db
REDIS_URL: redis://localhost:6380
```

## 🔍 PR Check Workflow

### Purpose

Lightweight validation for pull requests with faster feedback.

### Features

- Runs on pull requests to `main` or `develop`
- Includes automatic PR commenting with results
- Focuses on essential checks (linting, unit tests, integration tests, build)

### PR Comments

The workflow automatically comments on PRs with:

- ✅ Success status and summary
- ❌ Failure status with guidance
- List of tests run
- Timestamp of last update

## 🚀 Deploy Workflow

### Triggers

- Runs after successful CI workflow completion
- Only on `main` branch

### Jobs

#### 1. Deploy to Production

- **Condition**: CI workflow succeeded
- **Steps**:
  - Build application
  - Create deployment package
  - Upload deployment artifacts
  - Execute deployment (configurable)
  - Send notifications

#### 2. Rollback

- **Condition**: CI workflow failed
- **Steps**:
  - Execute rollback procedures
  - Send failure notifications

### Deployment Options

The workflow includes examples for various deployment targets:

```bash
# VPS Deployment
scp -r deployment/* user@your-server:/path/to/app/
ssh user@your-server "cd /path/to/app && docker-compose up -d"

# Railway Deployment
railway login
railway up

# Heroku Deployment
heroku container:push web
heroku container:release web
```

## 🛠️ Setup Instructions

### 1. Repository Setup

1. **Enable GitHub Actions**:
   - Go to your repository settings
   - Navigate to "Actions" → "General"
   - Ensure "Allow all actions and reusable workflows" is selected

2. **Set up branch protection** (recommended):
   - Go to "Branches" → "Add rule"
   - Set up rules for `main` and `develop` branches
   - Require status checks to pass before merging

### 2. Environment Variables

For deployment workflows, you may need to set up secrets:

1. Go to repository settings → "Secrets and variables" → "Actions"
2. Add the following secrets if needed:
   ```
   SLACK_WEBHOOK_URL          # For notifications
   DEPLOY_SSH_KEY            # For VPS deployment
   DEPLOY_HOST              # Server hostname
   DEPLOY_USER              # Server username
   DEPLOY_PATH              # Server deployment path
   ```

### 3. Customize Deployment

Edit `.github/workflows/deploy.yml` and uncomment/modify the deployment section:

```yaml
- name: Deploy to VPS
  run: |
    scp -r deployment/* ${{ secrets.DEPLOY_USER }}@${{ secrets.DEPLOY_HOST }}:${{ secrets.DEPLOY_PATH }}/
    ssh ${{ secrets.DEPLOY_USER }}@${{ secrets.DEPLOY_HOST }} "cd ${{ secrets.DEPLOY_PATH }} && docker-compose up -d"
```

## 📊 Monitoring and Notifications

### Coverage Reports

- Coverage reports are uploaded as artifacts
- Available for 30 days
- Can be integrated with Codecov or similar services

### Notifications

The workflows support various notification methods:

```yaml
# Slack notifications
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: success
    text: 'Deployment completed successfully!'
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

# Email notifications (via custom script)
- name: Send email notification
  run: |
    # Your email notification script
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Failures

```bash
# Check if services are running
docker ps | grep postgres
docker ps | grep redis

# Check service logs
docker logs <container-id>
```

#### 2. Test Failures

- Ensure `.env.test` is properly configured
- Check database migrations are up to date
- Verify all dependencies are installed

#### 3. Build Failures

- Check TypeScript compilation errors
- Verify all imports are correct
- Ensure build script exists in `package.json`

#### 4. Deployment Failures

- Verify deployment credentials
- Check server connectivity
- Ensure deployment path exists and has proper permissions

### Debugging Workflows

1. **Enable debug logging**:
   Add `ACTIONS_STEP_DEBUG: true` to repository secrets

2. **Check workflow logs**:
   - Go to "Actions" tab in your repository
   - Click on the failed workflow
   - Review step-by-step logs

3. **Re-run workflows**:
   - Use "Re-run jobs" option in the Actions tab
   - Or push a new commit to trigger re-run

## 📈 Performance Optimization

### Caching

- Node modules are cached using `actions/setup-node@v4`
- Cache key: `npm` (automatic)

### Parallel Jobs

- Security audit and build jobs run in parallel after tests
- Reduces total workflow time

### Service Optimization

- PostgreSQL and Redis use Alpine images for faster startup
- Health checks ensure services are ready before tests

## 🔒 Security Considerations

### Secrets Management

- Never commit secrets to the repository
- Use GitHub Secrets for sensitive data
- Rotate secrets regularly

### Dependency Scanning

- Security audit runs on every PR and push
- Moderate and high-level vulnerabilities are checked
- Consider integrating with Dependabot for automated updates

### Environment Isolation

- Test environment uses isolated databases
- Production secrets are never exposed in test environments
- Separate deployment environments for staging and production

## 📝 Customization

### Adding New Workflows

1. Create new `.yml` file in `.github/workflows/`
2. Define triggers and jobs
3. Test locally using `act` (optional)

### Modifying Existing Workflows

1. Edit the appropriate workflow file
2. Test changes in a feature branch
3. Monitor workflow execution

### Adding New Test Types

1. Add test scripts to `package.json`
2. Update workflow steps to include new tests
3. Ensure proper environment setup

## 🆘 Getting Help

- Check GitHub Actions documentation: https://docs.github.com/en/actions
- Review workflow logs for detailed error messages
- Test workflows locally using `act` tool
- Consult the test documentation in `test/README.md`
