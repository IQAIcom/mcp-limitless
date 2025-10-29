# CI/CD Documentation

## Overview

This project uses GitHub Actions for continuous integration and deployment. All workflows are defined in `.github/workflows/`.

## Workflows

### 1. CI Workflow (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**

#### Lint
- Runs Biome linter
- Checks code formatting
- **Node version:** 20

#### Test
- Runs unit tests across multiple Node versions
- **Node versions:** 18, 20, 22
- Uploads coverage to Codecov (Node 20 only)
- **Matrix strategy:** Fail-fast disabled to test all versions

#### Coverage
- Generates full coverage report
- Uploads coverage artifacts (7-day retention)
- Comments coverage on PRs using Vitest Coverage Report Action
- **Node version:** 20

#### Build
- Builds the project
- Uploads build artifacts (7-day retention)
- **Node version:** 20

#### Integration Tests (Optional)
- Only runs on pushes to `main`
- Continues even if tests fail
- **Environment:** 15-second timeout for API calls
- **Node version:** 20

#### All Checks
- Final job that depends on all required jobs
- Ensures all critical checks pass before merging

### 2. Publish Workflow (`publish.yml`)

**Triggers:**
- GitHub releases
- Manual workflow dispatch

**Jobs:**

#### Publish
- Runs linter and unit tests
- Builds the package
- Publishes to npm with provenance
- Comments on release with installation instructions

**Requirements:**
- `NPM_TOKEN` secret must be configured
- Package must have unique version

### 3. CodeQL Workflow (`codeql.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main`
- Weekly schedule (Mondays at 6:00 AM UTC)

**Jobs:**

#### Analyze
- Runs CodeQL security analysis
- Scans for security vulnerabilities
- Checks code quality
- Results appear in Security tab

## Configuration Files

### Dependabot (`dependabot.yml`)

**NPM Dependencies:**
- Weekly updates on Mondays at 9:00 AM ET
- Groups minor and patch updates
- Separate groups for dev and production dependencies
- Max 10 open PRs
- Auto-labels: `dependencies`, `automated`

**GitHub Actions:**
- Weekly updates on Mondays
- Auto-labels: `dependencies`, `github-actions`

## Required Secrets

Configure these in repository settings → Secrets and variables → Actions:

### For Publishing
- `NPM_TOKEN`: npm authentication token for publishing packages
  - Get from [npmjs.com/settings/tokens](https://www.npmjs.com/settings/~/tokens)
  - Token type: Automation

### For Coverage (Optional)
- `CODECOV_TOKEN`: Codecov upload token
  - Get from [codecov.io](https://codecov.io)
  - Only needed if using Codecov

## Branch Protection Rules

Recommended rules for `main` branch:

1. **Require pull request before merging**
   - Required approvals: 1
   - Dismiss stale reviews: Yes

2. **Require status checks to pass**
   - Lint
   - Test (Node 18, 20, 22)
   - Coverage
   - Build

3. **Require branches to be up to date before merging**

4. **Do not allow bypassing the above settings**

## Environment Variables

### CI Environment
- `CI=true` - Automatically set by GitHub Actions
- `NODE_ENV=test` - Set during test runs

### Custom Variables
- `SKIP_INTEGRATION_TESTS=true` - Skip integration tests (default in CI)
- `INTEGRATION_TEST_TIMEOUT=15000` - Timeout for integration tests (ms)

## Artifacts

### Coverage Reports
- **Retention:** 7 days
- **Location:** Actions → Workflow run → Artifacts
- **Contents:** HTML report, JSON coverage data

### Build Artifacts
- **Retention:** 7 days
- **Location:** Actions → Workflow run → Artifacts
- **Contents:** Compiled `dist/` directory

## Local CI Simulation

Run the same checks that CI runs:

```bash
# Lint check
pnpm run lint

# Format check
pnpm run format --check

# Unit tests
pnpm test:unit

# Coverage
pnpm test:coverage

# Build
pnpm run build
```

Run all checks at once:

```bash
# Create a script (ci-check.sh)
#!/bin/bash
set -e
echo "Running lint..."
pnpm run lint
echo "Running format check..."
pnpm run format --check
echo "Running tests..."
pnpm test:unit
echo "Running build..."
pnpm run build
echo "✅ All CI checks passed!"
```

## Troubleshooting

### Tests Failing in CI but Passing Locally

1. **Check Node version:**
   ```bash
   node --version
   # Should match CI version (18, 20, or 22)
   ```

2. **Clean install:**
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install --frozen-lockfile
   ```

3. **Check environment:**
   ```bash
   CI=true pnpm test:unit
   ```

### Build Failing in CI

1. **Check for missing dependencies:**
   - Ensure all imports use `.js` extensions
   - Verify TypeScript configuration

2. **Test build locally:**
   ```bash
   pnpm run build
   ```

### Coverage Not Uploading

1. **Check Codecov token:**
   - Verify `CODECOV_TOKEN` is set correctly
   - Token must have write access

2. **Check coverage files:**
   ```bash
   pnpm test:coverage
   ls -la coverage/
   ```

### Publish Failing

1. **Check npm token:**
   - Verify `NPM_TOKEN` is valid
   - Token must have publish access

2. **Check version:**
   - Ensure version in `package.json` is unique
   - Version must not exist on npm

3. **Check package name:**
   - Verify package name is available on npm
   - Check for scope/access issues

## Performance Tips

### Faster CI Runs

1. **Use pnpm caching** (already configured)
2. **Run jobs in parallel** (already configured)
3. **Skip integration tests** by default (already configured)
4. **Use matrix strategy** for multiple Node versions (already configured)

### Reducing API Calls

Integration tests use rate limiting to avoid hitting API limits:
```typescript
await rateLimitDelay(1000); // 1 second delay
```

## Monitoring

### GitHub Actions Dashboard

View all workflow runs:
- Repository → Actions

### Status Badges

Add to README.md:
```markdown
![CI](https://github.com/IQAIcom/mcp-limitless/actions/workflows/ci.yml/badge.svg)
![CodeQL](https://github.com/IQAIcom/mcp-limitless/actions/workflows/codeql.yml/badge.svg)
[![codecov](https://codecov.io/gh/IQAIcom/mcp-limitless/branch/main/graph/badge.svg)](https://codecov.io/gh/IQAIcom/mcp-limitless)
```

### Notifications

Configure notifications in:
- Personal settings → Notifications
- Watch the repository for workflow failures

## Best Practices

1. ✅ **Always run tests before pushing**
2. ✅ **Keep dependencies up to date** (Dependabot helps)
3. ✅ **Monitor security alerts** (CodeQL)
4. ✅ **Review coverage reports** (aim for 80%+)
5. ✅ **Use semantic versioning** for releases
6. ✅ **Write good commit messages** (conventional commits)
7. ✅ **Update docs** with code changes

## Future Enhancements

Potential improvements to consider:

- [ ] Add Docker build and publish
- [ ] Add performance benchmarking
- [ ] Add visual regression testing
- [ ] Add canary deployments
- [ ] Add release notes generation
- [ ] Add changelog automation
- [ ] Add security scanning (Snyk, etc.)
- [ ] Add bundle size tracking

## Questions?

See [CONTRIBUTING.md](./CONTRIBUTING.md) for more details on the development workflow.
