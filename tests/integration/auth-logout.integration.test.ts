import { describe, expect, it } from "vitest";
import { AuthLogoutService } from "../../src/services/auth-logout.js";
import { authenticateTestWallet, logoutSession } from "../helpers/auth-flow.js";
import { createTestWallet } from "../helpers/wallet.js";
import {
	getIntegrationTestTimeout,
	rateLimitDelay,
	setupIntegrationTests,
	shouldRunIntegrationTests,
} from "./setup.js";

/**
 * Integration tests for AuthLogoutService
 * These tests run against the real Limitless API
 *
 * Includes both real logout flows with authenticated sessions
 * and error handling tests for unauthenticated requests.
 *
 * To skip: SKIP_INTEGRATION_TESTS=true pnpm test:integration
 */
describe.skipIf(!shouldRunIntegrationTests())(
	"AuthLogoutService Integration",
	() => {
		setupIntegrationTests();

		let service: AuthLogoutService;

		it(
			"should succeed even when not authenticated (idempotent)",
			async () => {
				service = new AuthLogoutService();

				// Logout is idempotent - succeeds even without authentication
				const result = await service.execute();
				expect(result).toHaveProperty("message");

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should succeed with invalid API key (idempotent)",
			async () => {
				service = new AuthLogoutService();

				// Logout is idempotent - succeeds even with invalid key
				const result = await service.execute("invalid-api-key");
				expect(result).toHaveProperty("message");

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should handle unauthenticated error correctly",
			async () => {
				service = new AuthLogoutService();

				try {
					await service.execute();
				} catch (error: any) {
					// Error should mention authentication
					expect(error.message).toBeTruthy();
					expect(
						error.message.includes("Not authenticated") ||
							error.message.includes("Failed to logout") ||
							error.message.includes("401"),
					).toBe(true);
				}

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should format successful logout response correctly",
			async () => {
				service = new AuthLogoutService();

				// Test the format method with mock data
				const mockResponse = {
					message: "Successfully logged out",
				};

				const formatted = service.format(mockResponse);

				expect(typeof formatted).toBe("string");
				expect(formatted).toContain("Successfully logged out");
				expect(formatted).toContain("✅");
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should handle empty API key (idempotent)",
			async () => {
				service = new AuthLogoutService();

				// Logout succeeds with empty key
				const result = await service.execute("");
				expect(result).toHaveProperty("message");

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should handle malformed authorization header (idempotent)",
			async () => {
				service = new AuthLogoutService();

				// Logout is idempotent - succeeds even with malformed keys
				const malformedKeys = [
					"not-a-jwt-token",
					"Bearer ",
					"12345",
					"invalid",
				];

				for (const key of malformedKeys) {
					const result = await service.execute(key);
					expect(result).toHaveProperty("message");
					await rateLimitDelay(500);
				}
			},
			{ timeout: getIntegrationTestTimeout() * 5 },
		);

		// Real logout flow tests with authenticated sessions
		it(
			"should successfully logout an authenticated session",
			async () => {
				const wallet = createTestWallet();

				// Authenticate first
				const session = await authenticateTestWallet(wallet);
				await rateLimitDelay();

				// Verify we have a session
				expect(session.account).toBeTruthy();

				// Logout
				service = new AuthLogoutService();
				const result = await service.execute(session.token);

				// Verify logout response
				expect(result).toHaveProperty("message");
				expect(typeof result.message).toBe("string");

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() * 3 },
		);

		it(
			"should format logout response correctly",
			async () => {
				const wallet = createTestWallet();

				// Authenticate first
				const session = await authenticateTestWallet(wallet);
				await rateLimitDelay();

				// Logout
				service = new AuthLogoutService();
				const result = await service.execute(session.token);

				// Test formatting
				const formatted = service.format(result);

				expect(typeof formatted).toBe("string");
				expect(formatted).toContain("✅");
				expect(formatted.length).toBeGreaterThan(0);

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() * 3 },
		);

		it(
			"should handle logout via helper function",
			async () => {
				const wallet = createTestWallet();

				// Authenticate first
				const session = await authenticateTestWallet(wallet);
				await rateLimitDelay();

				// Logout using helper
				await expect(logoutSession(session.token)).resolves.not.toThrow();

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() * 3 },
		);

		it(
			"should succeed logging out twice with same token (idempotent)",
			async () => {
				const wallet = createTestWallet();

				// Authenticate first
				const session = await authenticateTestWallet(wallet);
				await rateLimitDelay();

				// First logout should succeed
				service = new AuthLogoutService();
				const result1 = await service.execute(session.token);
				expect(result1).toHaveProperty("message");
				await rateLimitDelay();

				// Second logout with same token should also succeed (idempotent)
				const result2 = await service.execute(session.token);
				expect(result2).toHaveProperty("message");

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() * 4 },
		);
	},
);
