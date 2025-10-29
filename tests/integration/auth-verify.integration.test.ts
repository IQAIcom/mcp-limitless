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
 * Note: These tests expect to not be authenticated in the test environment
 *
 * To skip: SKIP_INTEGRATION_TESTS=true pnpm test:integration
 */
describe.skipIf(!shouldRunIntegrationTests())(
	"AuthVerifyService Integration",
	() => {
		setupIntegrationTests();

		let service: AuthVerifyService;

		it(
			"should throw when not authenticated",
			async () => {
				service = new AuthVerifyService();

				// In test environment without auth, should throw
				await expect(service.execute()).rejects.toThrow(
					"Not authenticated. Please login first.",
				);

				await rateLimitDelay();
			},
			getIntegrationTestTimeout(),
		);

		it(
			"should contain helpful error message",
			async () => {
				service = new AuthVerifyService();

				try {
					await service.execute();
				} catch (error: any) {
					expect(error.message).toContain("Not authenticated");
					expect(error.message).toContain("login");
				}

				await rateLimitDelay();
			},
			getIntegrationTestTimeout(),
		);

		it(
			"should handle invalid API key",
			async () => {
				service = new AuthVerifyService();

				await expect(service.execute("invalid-api-key")).rejects.toThrow();

				await rateLimitDelay();
			},
			getIntegrationTestTimeout(),
		);
	},
);
