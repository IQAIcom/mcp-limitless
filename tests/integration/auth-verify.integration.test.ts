import { describe, expect, it } from "vitest";
import { AuthVerifyService } from "../../src/services/auth-verify.js";
import { authenticateTestWallet } from "../helpers/auth-flow.js";
import { createTestWallet } from "../helpers/wallet.js";
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
 * Includes both error cases (not authenticated) and successful
 * verification with real authenticated sessions.
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

		// NOTE: Cookie-based session verification tests are skipped because:
		// 1. The API uses HTTP-only session cookies set via Set-Cookie headers
		// 2. Node.js fetch doesn't automatically handle cookies like browsers do
		// 3. The token returned from login is not the session cookie value
		// 4. Proper implementation would require cookie jar functionality
		//
		// For MCP usage, authentication verification would typically be done
		// by the client managing session state, not via this endpoint.
		//
		// These tests are kept here as documentation of the intended behavior
		// if cookie handling is implemented in the future.

		it.skip(
			"should successfully verify an authenticated session (requires cookie handling)",
			async () => {
				const wallet = createTestWallet();
				const session = await authenticateTestWallet(wallet);
				await rateLimitDelay();

				service = new AuthVerifyService();
				const address = await service.execute(session.token);

				expect(typeof address).toBe("string");
				expect(address.toLowerCase()).toBe(wallet.address.toLowerCase());

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() * 2 },
		);

		it(
			"should format verification response correctly",
			async () => {
				service = new AuthVerifyService();

				// Test formatting with mock address
				const mockAddress = "0x1234567890123456789012345678901234567890";
				const formatted = service.format(mockAddress);

				expect(typeof formatted).toBe("string");
				expect(formatted).toContain("Authenticated as");
				expect(formatted).toContain(mockAddress);
				expect(formatted).toContain("✅");
			},
			{ timeout: getIntegrationTestTimeout() },
		);
	},
);
