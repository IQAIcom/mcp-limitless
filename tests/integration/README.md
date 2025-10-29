# Integration Tests

Integration tests for the MCP Limitless server that run against the real Limitless API.

## Purpose

Integration tests validate:
- API contract compliance
- Real-world behavior
- End-to-end functionality
- Error handling with actual API responses

## Running Integration Tests

### Run all integration tests
```bash
pnpm test:integration
```

### Skip integration tests
```bash
SKIP_INTEGRATION_TESTS=true pnpm test:integration
```

### Run with custom timeout
```bash
INTEGRATION_TEST_TIMEOUT=15000 pnpm test:integration
```

## Important Notes

### Rate Limiting
Integration tests include rate limiting delays to avoid overwhelming the API. Tests may take longer to run than unit tests.

### API Availability
Tests require access to `https://api.limitless.exchange`. If the API is down or unreachable, tests will fail.

### Test Data
Tests use real market data from the Limitless platform. Results may vary based on:
- Available markets at test time
- Market state changes
- API response times

### CI/CD Considerations
Consider skipping integration tests in CI pipelines if:
- API rate limits are a concern
- Network access is restricted
- Fast feedback is prioritized

Set `SKIP_INTEGRATION_TESTS=true` in your CI environment variables.

## Adding New Integration Tests

1. Create a new test file: `tests/integration/[feature].integration.test.ts`
2. Import setup utilities from `./setup.js`
3. Use `describe.skipIf(!shouldRunIntegrationTests())` to make tests skippable
4. Add rate limiting delays with `rateLimitDelay()`
5. Set appropriate timeouts for API calls

Example:
```typescript
import { describe, it, expect } from "vitest";
import {
  setupIntegrationTests,
  shouldRunIntegrationTests,
  getIntegrationTestTimeout,
  rateLimitDelay,
} from "./setup.js";

describe.skipIf(!shouldRunIntegrationTests())(
  "My Integration Test",
  () => {
    setupIntegrationTests();

    it("should test something", async () => {
      // your test
      await rateLimitDelay();
    }, { timeout: getIntegrationTestTimeout() });
  }
);
```

## Environment Variables

- `SKIP_INTEGRATION_TESTS`: Set to "true" to skip integration tests
- `INTEGRATION_TEST_TIMEOUT`: Timeout in milliseconds (default: 10000)
