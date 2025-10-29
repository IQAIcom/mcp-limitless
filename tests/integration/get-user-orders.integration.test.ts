import { describe, expect, it } from "vitest";
import { GetUserOrdersService } from "../../src/services/get-user-orders.js";
import {
	getIntegrationTestTimeout,
	rateLimitDelay,
	setupIntegrationTests,
	shouldRunIntegrationTests,
} from "./setup.js";

/**
 * Integration tests for GetUserOrdersService
 * These tests run against the real Limitless API
 *
 * This endpoint requires authentication. Tests validate error handling
 * when not authenticated. Full authenticated flow tests are skipped
 * because they require complex cookie session handling.
 *
 * To skip: SKIP_INTEGRATION_TESTS=true pnpm test:integration
 */
describe.skipIf(!shouldRunIntegrationTests())(
	"GetUserOrdersService Integration",
	() => {
		setupIntegrationTests();

		let service: GetUserOrdersService;
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
				service = new GetUserOrdersService();
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
				service = new GetUserOrdersService();
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
				service = new GetUserOrdersService();

				// Even with invalid slug, should fail on auth first
				await expect(
					service.execute("nonexistent-market-slug-99999"),
				).rejects.toThrow();

				await rateLimitDelay();
			},
			getIntegrationTestTimeout(),
		);

		it(
			"should format user orders response correctly",
			async () => {
				service = new GetUserOrdersService();

				// Test formatting with mock data
				const mockResponse = {
					orders: [
						{
							id: "order-123",
							side: "BUY",
							price: "0.65",
							quantity: "100",
							status: "OPEN",
						},
						{
							id: "order-456",
							side: "SELL",
							price: "0.75",
							quantity: "50",
							status: "FILLED",
						},
					],
				};

				const formatted = service.format(mockResponse, "test-market-slug");

				expect(typeof formatted).toBe("string");
				expect(formatted).toContain("Your Orders");
				expect(formatted).toContain("test-market-slug");
				expect(formatted).toContain("order-123");
				expect(formatted).toContain("order-456");
				expect(formatted).toContain("BUY");
				expect(formatted).toContain("SELL");
				expect(formatted).toContain("0.65");
				expect(formatted).toContain("0.75");
				expect(formatted).toContain("Total Orders: 2");
				expect(formatted).toContain("📝");
			},
			getIntegrationTestTimeout(),
		);

		it(
			"should format empty orders response correctly",
			async () => {
				service = new GetUserOrdersService();

				const mockResponse = {
					orders: [],
				};

				const formatted = service.format(mockResponse, "test-market-slug");

				expect(formatted).toContain("No orders found");
				expect(formatted).toContain("test-market-slug");
			},
			getIntegrationTestTimeout(),
		);

		it(
			"should format single order correctly",
			async () => {
				service = new GetUserOrdersService();

				const mockResponse = {
					orders: [
						{
							id: "order-789",
							side: "BUY",
							price: "0.50",
							quantity: "200",
							status: "PARTIALLY_FILLED",
						},
					],
				};

				const formatted = service.format(mockResponse, "test-market-slug");

				expect(formatted).toContain("order-789");
				expect(formatted).toContain("BUY");
				expect(formatted).toContain("0.50");
				expect(formatted).toContain("200");
				expect(formatted).toContain("PARTIALLY_FILLED");
				expect(formatted).toContain("Total Orders: 1");
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
			"should successfully get user orders when authenticated (requires cookie handling)",
			async () => {
				service = new GetUserOrdersService();
				const slug = await getRealMarketSlug();

				// This would require proper authentication setup
				const result = await service.execute(slug, "valid-api-key");

				expect(result).toHaveProperty("orders");
				expect(Array.isArray(result.orders)).toBe(true);

				// If orders exist, validate structure
				if (result.orders.length > 0) {
					const order = result.orders[0];
					expect(order).toHaveProperty("id");
					expect(order).toHaveProperty("side");
					expect(order).toHaveProperty("price");
					expect(order).toHaveProperty("quantity");
					expect(order).toHaveProperty("status");
				}

				await rateLimitDelay();
			},
			getIntegrationTestTimeout() * 2,
		);
	},
);
