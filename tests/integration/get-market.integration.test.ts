import { describe, expect, it } from "vitest";
import { GetMarketService } from "../../src/services/get-market.js";
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

			// Use active slugs endpoint instead of search since search returns empty results
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
			"should get market details by slug",
			async () => {
				service = new GetMarketService();
				const slug = await getRealMarketSlug();
				await rateLimitDelay(500);

				const result = await service.execute(slug);

				// Validate response structure
				expect(result).toHaveProperty("question");
				expect(result).toHaveProperty("slug");

				// Validate data types
				expect(typeof result.question).toBe("string");
				expect(typeof result.slug).toBe("string");

				// Address is optional (can be null)
				if (result.address) {
					expect(typeof result.address).toBe("string");
				}

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
			"should handle markets with and without address field",
			async () => {
				service = new GetMarketService();
				const slug = await getRealMarketSlug();
				await rateLimitDelay(500);

				const result = await service.execute(slug);

				// Address is optional
				expect(result).toBeDefined();
				expect(result.question).toBeTruthy();
				expect(result.slug).toBe(slug);

				// If address exists, it should be a string
				if (result.address !== undefined) {
					expect(typeof result.address).toBe("string");
				}

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() * 2 },
		);
	},
);
