import { describe, expect, it } from "vitest";
import { GetMarketService } from "../../src/services/get-market.js";
import { SearchMarketsService } from "../../src/services/search-markets.js";
import {
	getIntegrationTestTimeout,
	rateLimitDelay,
	setupIntegrationTests,
	shouldRunIntegrationTests,
} from "./setup.js";

/**
 * Integration tests for GetMarketService
 * These tests run against the real Limitless API
 *
 * To skip: SKIP_INTEGRATION_TESTS=true pnpm test:integration
 */
describe.skipIf(!shouldRunIntegrationTests())(
	"GetMarketService Integration",
	() => {
		setupIntegrationTests();

		let service: GetMarketService;
		let testMarketSlug: string | null = null;

		// Helper to get a real market slug for testing
		const getRealMarketSlug = async (): Promise<string> => {
			if (testMarketSlug) return testMarketSlug;

			const searchService = new SearchMarketsService();
			const searchResult = await searchService.execute("bitcoin", 1);

			if (searchResult.markets.length > 0) {
				testMarketSlug = searchResult.markets[0].slug;
				return testMarketSlug;
			}

			throw new Error("No markets found for testing");
		};

		it(
			"should get market details by slug",
			async () => {
				service = new GetMarketService();
				const slug = await getRealMarketSlug();
				await rateLimitDelay(500);

				const result = await service.execute(slug);

				// Validate response structure
				expect(result).toHaveProperty("question");
				expect(result).toHaveProperty("slug");
				expect(result).toHaveProperty("address");

				// Validate data types
				expect(typeof result.question).toBe("string");
				expect(typeof result.slug).toBe("string");
				expect(typeof result.address).toBe("string");

				// Slug should match
				expect(result.slug).toBe(slug);

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() * 2 },
		);

		it(
			"should return formatted market details",
			async () => {
				service = new GetMarketService();
				const slug = await getRealMarketSlug();
				await rateLimitDelay(500);

				const result = await service.execute(slug);
				const formatted = service.format(result);

				expect(typeof formatted).toBe("string");
				expect(formatted.length).toBeGreaterThan(0);

				// Should contain key elements
				expect(formatted).toContain("Market Details");
				expect(formatted).toContain(result.question);
				expect(formatted).toContain(result.slug);
				expect(formatted).toContain("limitless.exchange/markets");

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() * 2 },
		);

		it(
			"should handle nonexistent market slug",
			async () => {
				service = new GetMarketService();

				await expect(
					service.execute("nonexistent-market-slug-99999"),
				).rejects.toThrow();

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should include optional fields when present",
			async () => {
				service = new GetMarketService();
				const slug = await getRealMarketSlug();
				await rateLimitDelay(500);

				const result = await service.execute(slug);

				// These fields may or may not be present depending on the market
				// Just verify the response structure is valid
				if (result.category) {
					expect(typeof result.category).toBe("string");
				}

				if (result.volume) {
					expect(typeof result.volume).toBe("string");
				}

				if (result.liquidity) {
					expect(typeof result.liquidity).toBe("string");
				}

				if (result.outcomes) {
					expect(Array.isArray(result.outcomes)).toBe(true);
				}

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() * 2 },
		);

		it(
			"should work with market address if slug fails",
			async () => {
				service = new GetMarketService();
				const slug = await getRealMarketSlug();
				await rateLimitDelay(500);

				// First get the market to get its address
				const marketBySlug = await service.execute(slug);
				await rateLimitDelay(500);

				// Now try to get by address
				const marketByAddress = await service.execute(marketBySlug.address);

				// Should return the same market
				expect(marketByAddress.slug).toBe(marketBySlug.slug);
				expect(marketByAddress.address).toBe(marketBySlug.address);

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() * 3 },
		);
	},
);
