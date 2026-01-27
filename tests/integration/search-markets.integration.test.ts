import { describe, expect, it } from "vitest";
import { SearchMarketsService } from "../../src/services/search-markets.js";
import {
	getIntegrationTestTimeout,
	rateLimitDelay,
	setupIntegrationTests,
	shouldRunIntegrationTests,
} from "./setup.js";

/**
 * Integration tests for SearchMarketsService
 * These tests run against the real Limitless API
 *
 * To skip: SKIP_INTEGRATION_TESTS=true pnpm test:integration
 */
describe.skipIf(!shouldRunIntegrationTests())(
	"SearchMarketsService Integration",
	() => {
		setupIntegrationTests();

		let service: SearchMarketsService;

		it(
			"should search for real markets using the API",
			async () => {
				service = new SearchMarketsService();

				const result = await service.execute("bitcoin", 5);

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
				}

				// Rate limit
				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should return formatted results",
			async () => {
				service = new SearchMarketsService();

				const result = await service.execute("crypto", 3);
				const formatted = service.format(result);

				expect(typeof formatted).toBe("string");
				expect(formatted.length).toBeGreaterThan(0);

				// Should contain key formatting elements
				if (result.total > 0) {
					expect(formatted).toContain("Found");
					expect(formatted).toContain("markets");
				}

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should handle pagination",
			async () => {
				service = new SearchMarketsService();

				const page1 = await service.execute("prediction", 2, 1);
				await rateLimitDelay(500);

				const page2 = await service.execute("prediction", 2, 2);

				expect(page1.page).toBe(1);
				expect(page2.page).toBe(2);

				// Pages should have different markets (if enough results exist)
				if (page1.total > 2 && page2.markets.length > 0) {
					expect(page1.markets[0].slug).not.toBe(page2.markets[0].slug);
				}

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() * 2 },
		);

		it(
			"should handle similarity threshold parameter",
			async () => {
				service = new SearchMarketsService();

				const highThreshold = await service.execute("bitcoin", 10, 1, 0.8);
				await rateLimitDelay(500);

				const lowThreshold = await service.execute("bitcoin", 10, 1, 0.3);

				// Lower threshold should return more or equal results
				expect(lowThreshold.total).toBeGreaterThanOrEqual(highThreshold.total);

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() * 2 },
		);

		it(
			"should handle unusual queries gracefully",
			async () => {
				service = new SearchMarketsService();

				// Use a very specific unlikely query - semantic search may still return results
				const result = await service.execute(
					"xyzabc123nonexistentquery999",
					10,
					1,
					0.9,
				);
				const formatted = service.format(result);

				// Verify the API handles the query gracefully
				expect(result).toHaveProperty("markets");
				expect(Array.isArray(result.markets)).toBe(true);
				expect(typeof formatted).toBe("string");
				expect(formatted.length).toBeGreaterThan(0);

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);
	},
);
