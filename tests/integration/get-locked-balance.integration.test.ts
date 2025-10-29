import { describe, expect, it } from "vitest";
import { GetLockedBalanceService } from "../../src/services/get-locked-balance.js";
import {
	getIntegrationTestTimeout,
	rateLimitDelay,
	setupIntegrationTests,
	shouldRunIntegrationTests,
} from "./setup.js";

/**
 * Integration tests for GetLockedBalanceService
 * These tests run against the real Limitless API
 *
 * This endpoint requires authentication. Tests validate error handling
 * when not authenticated. Full authenticated flow tests are skipped
 * because they require complex cookie session handling.
 *
 * To skip: SKIP_INTEGRATION_TESTS=true pnpm test:integration
 */
describe.skipIf(!shouldRunIntegrationTests())(
	"GetLockedBalanceService Integration",
	() => {
		setupIntegrationTests();

		let service: GetLockedBalanceService;
		let testMarketSlug: string | null = null;

		// Helper to get a real market slug for testing
		const getRealMarketSlug = async (): Promise<string> => {
			if (testMarketSlug) return testMarketSlug;

			const response = await fetch(
				"https://api.limitless.exchange/markets/active/slugs?limit=1",
			);
			const slugs = (await response.json()) as Array<{ slug: string }>;

			if (slugs && slugs.length > 0) {
				testMarketSlug = slugs[0].slug;
				return testMarketSlug;
			}

			throw new Error("No markets found for testing");
		};

		it(
			"should throw when not authenticated",
			async () => {
				service = new GetLockedBalanceService();
				const slug = await getRealMarketSlug();
				await rateLimitDelay(500);

				// Without API key, should throw unauthorized error
				await expect(service.execute(slug)).rejects.toThrow(
					"Unauthorized. This tool requires authentication.",
				);

				await rateLimitDelay();
			},
			getIntegrationTestTimeout() * 2,
		);

		it(
			"should throw with invalid API key",
			async () => {
				service = new GetLockedBalanceService();
				const slug = await getRealMarketSlug();
				await rateLimitDelay(500);

				// With invalid API key, should throw unauthorized error
				await expect(
					service.execute(slug, "invalid-api-key-12345"),
				).rejects.toThrow();

				await rateLimitDelay();
			},
			getIntegrationTestTimeout() * 2,
		);

		it(
			"should handle invalid market slug",
			async () => {
				service = new GetLockedBalanceService();

				// Even with invalid slug, should fail on auth first
				await expect(
					service.execute("nonexistent-market-slug-99999"),
				).rejects.toThrow();

				await rateLimitDelay();
			},
			getIntegrationTestTimeout(),
		);

		it(
			"should format locked balance response correctly",
			async () => {
				service = new GetLockedBalanceService();

				// Test formatting with mock data
				const mockResponse = {
					lockedBalance: "1000000000",
					lockedBalanceFormatted: "1,000.00 USDC",
					currency: "USDC",
					orderCount: 5,
				};

				const formatted = service.format(mockResponse, "test-market-slug");

				expect(typeof formatted).toBe("string");
				expect(formatted).toContain("Locked Balance");
				expect(formatted).toContain("test-market-slug");
				expect(formatted).toContain("1,000.00 USDC");
				expect(formatted).toContain("Open Orders: 5");
				expect(formatted).toContain("🔒");
			},
			getIntegrationTestTimeout(),
		);

		it(
			"should format zero locked balance correctly",
			async () => {
				service = new GetLockedBalanceService();

				const mockResponse = {
					lockedBalance: "0",
					lockedBalanceFormatted: "0.00 USDC",
					currency: "USDC",
					orderCount: 0,
				};

				const formatted = service.format(mockResponse, "test-market-slug");

				expect(formatted).toContain("0.00 USDC");
				expect(formatted).toContain("Open Orders: 0");
			},
			getIntegrationTestTimeout(),
		);

		// NOTE: Authenticated flow tests are skipped because:
		// 1. The API uses HTTP-only session cookies set via Set-Cookie headers
		// 2. Node.js fetch doesn't automatically handle cookies like browsers do
		// 3. The token returned from login is not the session cookie value
		// 4. Proper implementation would require cookie jar functionality
		//
		// For MCP usage, authentication would be handled by the client
		// managing session state.

		it.skip(
			"should successfully get locked balance when authenticated (requires cookie handling)",
			async () => {
				service = new GetLockedBalanceService();
				const slug = await getRealMarketSlug();

				// This would require proper authentication setup
				const result = await service.execute(slug, "valid-api-key");

				expect(result).toHaveProperty("lockedBalance");
				expect(result).toHaveProperty("lockedBalanceFormatted");
				expect(result).toHaveProperty("currency");
				expect(result).toHaveProperty("orderCount");
				expect(typeof result.orderCount).toBe("number");

				await rateLimitDelay();
			},
			getIntegrationTestTimeout() * 2,
		);
	},
);
