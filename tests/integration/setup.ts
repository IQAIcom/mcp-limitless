/**
 * Integration test setup and configuration
 *
 * Integration tests run against the real Limitless API.
 * These tests are useful for:
 * - Validating API contracts haven't changed
 * - Testing real-world behavior
 * - Catching integration issues
 *
 * IMPORTANT: Integration tests should be run separately from unit tests
 * and may be skipped in CI if API access is limited or rate-limited.
 */

import { afterAll, beforeAll } from "vitest";

/**
 * Check if integration tests should run
 * Set SKIP_INTEGRATION_TESTS=true to skip these tests
 */
export const shouldRunIntegrationTests = (): boolean => {
	return process.env.SKIP_INTEGRATION_TESTS !== "true";
};

/**
 * Get integration test timeout (default: 10 seconds)
 * Real API calls may take longer than unit tests
 */
export const getIntegrationTestTimeout = (): number => {
	return Number.parseInt(process.env.INTEGRATION_TEST_TIMEOUT || "10000");
};

/**
 * Rate limiting helper to avoid hitting API rate limits
 * Increased default delay to 2 seconds to prevent 429 errors
 */
export const rateLimitDelay = async (ms = 2000): Promise<void> => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Setup function to run before all integration tests
 */
export const setupIntegrationTests = () => {
	beforeAll(() => {
		if (shouldRunIntegrationTests()) {
			console.log("🔗 Running integration tests against Limitless API");
			console.log("   Set SKIP_INTEGRATION_TESTS=true to skip");
		} else {
			console.log("⏭️  Skipping integration tests");
		}
	});

	afterAll(() => {
		if (shouldRunIntegrationTests()) {
			console.log("✅ Integration tests completed");
		}
	});
};

/**
 * Helper to skip test if integration tests are disabled
 */
export const skipIfIntegrationDisabled = (test: any) => {
	return shouldRunIntegrationTests() ? test : test.skip;
};
