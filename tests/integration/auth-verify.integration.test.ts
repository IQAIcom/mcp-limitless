import { describe, expect, it } from "vitest";
import { AuthVerifyService } from "../../src/services/auth-verify.js";
import {
	getIntegrationTestTimeout,
	rateLimitDelay,
	setupIntegrationTests,
	shouldRunIntegrationTests,
} from "./setup.js";

/**
 * Integration tests for AuthVerifyService
 * These tests run against the real Limitless API
 *
 * To skip: SKIP_INTEGRATION_TESTS=true pnpm test:integration
 */
describe.skipIf(!shouldRunIntegrationTests())(
	"AuthVerifyService Integration",
	() => {
		setupIntegrationTests();

		let service: AuthVerifyService;

		it(
			"should check authentication status",
			async () => {
				service = new AuthVerifyService();

				const result = await service.execute();

				// Validate response structure
				expect(result).toHaveProperty("isAuthenticated");
				expect(typeof result.isAuthenticated).toBe("boolean");

				// Should also have optional account field
				if (result.account) {
					expect(typeof result.account).toBe("string");
				}

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should return formatted authentication status",
			async () => {
				service = new AuthVerifyService();

				const result = await service.execute();
				const formatted = service.format(result);

				expect(typeof formatted).toBe("string");
				expect(formatted.length).toBeGreaterThan(0);

				expect(formatted).toContain("Authentication Status");

				if (result.isAuthenticated) {
					expect(formatted).toContain("Authenticated");
					if (result.account) {
						expect(formatted).toContain("Account:");
					}
				} else {
					expect(formatted).toContain("Not authenticated");
				}

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should return not authenticated without session",
			async () => {
				service = new AuthVerifyService();

				// Without a valid session, should return not authenticated
				const result = await service.execute();

				// Most likely not authenticated in test environment
				expect(typeof result.isAuthenticated).toBe("boolean");

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should handle API response correctly",
			async () => {
				service = new AuthVerifyService();

				// This should not throw, even if not authenticated
				await expect(service.execute()).resolves.toBeDefined();

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);
	},
);
