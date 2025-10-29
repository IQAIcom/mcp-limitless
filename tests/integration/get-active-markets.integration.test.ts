import { describe, expect, it } from "vitest";
import { GetActiveMarketsService } from "../../src/services/get-active-markets.js";
import {
	getIntegrationTestTimeout,
	rateLimitDelay,
	setupIntegrationTests,
	shouldRunIntegrationTests,
} from "./setup.js";

/**
 * Integration tests for GetActiveMarketsService
 * These tests run against the real Limitless API
 *
 * To skip: SKIP_INTEGRATION_TESTS=true pnpm test:integration
 */
describe.skipIf(!shouldRunIntegrationTests())(
	"GetActiveMarketsService Integration",
	() => {
		setupIntegrationTests();

		let service: GetActiveMarketsService;

		it(
			"should get active markets from the API",
			async () => {
				service = new GetActiveMarketsService();

				const result = await service.execute(10);

				// Validate response structure
				expect(result).toHaveProperty("markets");
				expect(result).toHaveProperty("total");
				expect(result).toHaveProperty("page");
				expect(result).toHaveProperty("limit");

				// Validate markets array
				expect(Array.isArray(result.markets)).toBe(true);

				// If markets are found, validate structure
				if (result.markets.length > 0) {
					const firstMarket = result.markets[0];
					expect(firstMarket).toHaveProperty("title");
					expect(firstMarket).toHaveProperty("slug");
					expect(firstMarket).toHaveProperty("address");
				}

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should return formatted results",
			async () => {
				service = new GetActiveMarketsService();

				const result = await service.execute(5);
				const formatted = service.format(result);

				expect(typeof formatted).toBe("string");
				expect(formatted.length).toBeGreaterThan(0);

				// Should contain key formatting elements
				if (result.total > 0) {
					expect(formatted).toContain("Active Markets");
					expect(formatted).toContain("Total:");
				}

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should handle pagination",
			async () => {
				service = new GetActiveMarketsService();

				const page1 = await service.execute(3, 1);
				await rateLimitDelay(500);

				const page2 = await service.execute(3, 2);

				expect(page1.page).toBe(1);
				expect(page2.page).toBe(2);
				expect(page1.limit).toBe(3);
				expect(page2.limit).toBe(3);

				// Pages should have different markets (if enough results exist)
				if (
					page1.total > 3 &&
					page1.markets.length > 0 &&
					page2.markets.length > 0
				) {
					expect(page1.markets[0].slug).not.toBe(page2.markets[0].slug);
				}

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() * 2 },
		);

		it(
			"should respect limit parameter",
			async () => {
				service = new GetActiveMarketsService();

				const result = await service.execute(5);

				expect(result.markets.length).toBeLessThanOrEqual(5);
				expect(result.limit).toBe(5);

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should include market metadata",
			async () => {
				service = new GetActiveMarketsService();

				const result = await service.execute(1);

				if (result.markets.length > 0) {
					const market = result.markets[0];

					// Validate required fields
					expect(typeof market.title).toBe("string");
					expect(typeof market.slug).toBe("string");

					// Validate optional fields if present
					if (market.category) {
						expect(typeof market.category).toBe("string");
					}
					if (market.volumeFormatted) {
						expect(typeof market.volumeFormatted).toBe("string");
					}
					if (market.liquidityFormatted) {
						expect(typeof market.liquidityFormatted).toBe("string");
					}
				}

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);
	},
);
