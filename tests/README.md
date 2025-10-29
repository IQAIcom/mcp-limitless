# Testing Guide

Comprehensive testing documentation for the MCP Limitless server.

## Overview

This project uses a 3-tier testing approach:

1. **Unit Tests (Service Layer)** - Test services in isolation with mocked HTTP client
2. **Unit Tests (Tool Layer)** - Test tools with mocked services to validate schemas
3. **Integration Tests** - Test against the real Limitless API

## Project Structure

```
tests/
├── unit/
│   ├── services/          # Service layer tests
│   └── tools/             # Tool layer tests
├── integration/           # Integration tests against real API
│   ├── setup.ts          # Integration test configuration
│   └── README.md         # Integration test docs
└── helpers/
    ├── mock-client.ts    # Mock HTTP client for testing
    ├── test-utils.ts     # Common test utilities
    └── fixtures/         # API response fixtures
        ├── search-markets.ts
        ├── market.ts
        ├── orderbook.ts
        ├── portfolio.ts
        └── auth.ts
```

## Running Tests

### All tests
```bash
pnpm test
```

### Watch mode (re-run tests on file changes)
```bash
pnpm test:watch
```

### Unit tests only
```bash
pnpm test:unit
```

### Integration tests only
```bash
pnpm test:integration
```

### Skip integration tests
```bash
SKIP_INTEGRATION_TESTS=true pnpm test
```

### Coverage report
```bash
pnpm test:coverage
```

## Writing Tests

### Service Tests

Service tests use mocked HTTP clients to test API interaction and response formatting in isolation.

**Example:**
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MyService } from "../../../src/services/my-service.js";
import { myServiceFixture } from "../../helpers/fixtures/index.js";

// Mock the client module
vi.mock("../../../src/lib/client.js", () => ({
  client: {
    request: vi.fn(),
  },
}));

import { client } from "../../../src/lib/client.js";

describe("MyService", () => {
  let service: MyService;
  const mockClient = client as any;

  beforeEach(() => {
    service = new MyService();
    vi.clearAllMocks();
  });

  describe("execute", () => {
    it("should call API correctly", async () => {
      mockClient.request.mockResolvedValueOnce(myServiceFixture);

      const result = await service.execute("param");

      expect(mockClient.request).toHaveBeenCalledWith("/endpoint");
      expect(result).toEqual(myServiceFixture);
    });

    it("should handle errors", async () => {
      mockClient.request.mockRejectedValueOnce(new Error("API error"));

      await expect(service.execute("param")).rejects.toThrow();
    });
  });

  describe("format", () => {
    it("should format response correctly", () => {
      const formatted = service.format(myServiceFixture);

      expect(formatted).toContain("expected content");
    });
  });
});
```

### Tool Tests

Tool tests validate Zod schemas and test the tool execution flow with mocked services.

**Example:**
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { myTool } from "../../../src/tools/my-tool.js";

// Mock the service
vi.mock("../../../src/services/my-service.js", () => ({
  MyService: vi.fn().mockImplementation(() => ({
    execute: vi.fn(),
    format: vi.fn(),
  })),
}));

import { MyService } from "../../../src/services/my-service.js";

describe("myTool", () => {
  let mockService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockService = new MyService();
  });

  describe("parameter validation", () => {
    it("should validate required parameters", () => {
      const result = myTool.parameters.safeParse({
        requiredParam: "value",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid parameters", () => {
      const result = myTool.parameters.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("execute", () => {
    it("should execute successfully", async () => {
      mockService.execute.mockResolvedValueOnce({ data: "test" });
      mockService.format.mockReturnValueOnce("formatted");

      const result = await myTool.execute({ requiredParam: "value" });

      expect(mockService.execute).toHaveBeenCalledWith("value");
      expect(result).toBe("formatted");
    });

    it("should handle errors gracefully", async () => {
      mockService.execute.mockRejectedValueOnce(new Error("Test error"));

      const result = await myTool.execute({ requiredParam: "value" });

      expect(result).toContain("Error");
    });
  });
});
```

### Integration Tests

See [integration/README.md](./integration/README.md) for integration test documentation.

## Test Helpers

### Mock Client

Use `MockLimitlessAPIClient` to mock API responses:

```typescript
import { createMockClient } from "../../helpers/mock-client.js";

const mockClient = createMockClient();
mockClient.addMockResponse({
  endpoint: "/markets/search?query=bitcoin",
  method: "GET",
  response: { markets: [], total: 0 },
});
```

### Fixtures

Predefined API response fixtures are available in `tests/helpers/fixtures/`:

```typescript
import {
  searchMarketsSuccessResponse,
  marketDetailSuccessResponse,
  orderbookSuccessResponse,
} from "../../helpers/fixtures/index.js";
```

### Test Utilities

Common assertions and helpers:

```typescript
import {
  assertContainsAll,
  assertErrorMessage,
  assertMarketOutput,
  assertNoResults,
  generateTestMarket,
  generateTestAddress,
} from "../../helpers/test-utils.js";

// Use in tests
assertContainsAll(output, ["bitcoin", "market"]);
assertErrorMessage(error, "Failed to fetch");
```

## Coverage

### Viewing Coverage

After running `pnpm test:coverage`, open:
```
./coverage/index.html
```

### Coverage Goals

- **Services**: 90%+ coverage
- **Tools**: 90%+ coverage
- **Overall**: 85%+ coverage

### Excluded from Coverage

- Test files
- Configuration files
- Build artifacts (dist/)

## Best Practices

### 1. Test Isolation
- Each test should be independent
- Use `beforeEach` to reset state
- Clear all mocks between tests

### 2. Descriptive Test Names
```typescript
// Good
it("should return formatted market data when API returns valid response")

// Bad
it("works")
```

### 3. Test Both Success and Failure
```typescript
describe("execute", () => {
  it("should handle successful response");
  it("should handle API errors");
  it("should handle network timeouts");
  it("should handle invalid responses");
});
```

### 4. Use Fixtures
Don't inline large response objects - use fixtures:
```typescript
// Good
mockClient.request.mockResolvedValueOnce(searchMarketsSuccessResponse);

// Bad
mockClient.request.mockResolvedValueOnce({
  markets: [{ question: "...", /* 50 more fields */ }]
});
```

### 5. Mock at Module Level
Mock external dependencies at the module level:
```typescript
vi.mock("../../../src/lib/client.js", () => ({
  client: { request: vi.fn() },
}));
```

### 6. Integration Test Considerations
- Add rate limiting delays
- Set appropriate timeouts
- Make tests skippable
- Handle real API variability

## Continuous Integration

### Running Tests in CI

```yaml
# Example GitHub Actions workflow
- name: Run unit tests
  run: pnpm test:unit

- name: Run integration tests (optional)
  run: SKIP_INTEGRATION_TESTS=true pnpm test:integration

- name: Generate coverage
  run: pnpm test:coverage
```

## Adding Tests for New Features

When adding a new service/tool:

1. **Create service test**: `tests/unit/services/[name].test.ts`
   - Test `execute()` method with various scenarios
   - Test `format()` method output
   - Test error handling

2. **Create tool test**: `tests/unit/tools/[name].test.ts`
   - Test parameter validation (Zod schema)
   - Test execution flow
   - Test error handling

3. **Create fixtures** (if needed): `tests/helpers/fixtures/[name].ts`
   - Success responses
   - Error responses
   - Edge cases

4. **Add integration test** (optional): `tests/integration/[name].integration.test.ts`
   - Test against real API
   - Add rate limiting
   - Make skippable

## Troubleshooting

### Tests timing out
Increase timeout in test or vitest config:
```typescript
it("slow test", async () => {
  // test code
}, { timeout: 10000 });
```

### Mock not working
Ensure mock is defined before importing the module:
```typescript
vi.mock("./module");
import { something } from "./module"; // Import AFTER mock
```

### Integration tests failing
- Check API availability
- Verify network access
- Check rate limits
- Try skipping: `SKIP_INTEGRATION_TESTS=true`

### Coverage not generating
```bash
# Install coverage dependency
pnpm install --save-dev @vitest/coverage-v8

# Run coverage
pnpm test:coverage
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Zod Documentation](https://zod.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
