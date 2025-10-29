import { describe, expect, it } from "vitest";
import { GetHistoricalPriceService } from "../../src/services/get-historical-price.js";
import {
	getIntegrationTestTimeout,
	rateLimitDelay,
	setupIntegrationTests,
	shouldRunIntegrationTests,
} from "./setup.js";

/**
 * Integration tests for GetHistoricalPriceService
 * These tests run against the real Limitless API
 *
 * To skip: SKIP_INTEGRATION_TESTS=true pnpm test:integration
 */
describe.skipIf(!shouldRunIntegrationTests())(
	"GetHistoricalPriceService Integration",
	() => {
		setupIntegrationTests();

		let service: GetHistoricalPriceService;
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
			"should get historical price data for a market",
			async () => {
				service = new GetHistoricalPriceService();
				const slug = await getRealMarketSlug();
				await rateLimitDelay(500);

				const result = await service.execute(slug);

				// Validate response structure
				expect(result).toHaveProperty("slug");
				expect(result).toHaveProperty("history");

				expect(result.slug).toBe(slug);
				expect(Array.isArray(result.history)).toBe(true);

				// If history exists, validate structure
				if (result.history.length > 0) {
					const dataPoint = result.history[0];
					expect(dataPoint).toHaveProperty("t"); // timestamp
					expect(dataPoint).toHaveProperty("p"); // price

					expect(typeof dataPoint.t).toBe("number");
					expect(typeof dataPoint.p).toBe("number");
				}

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() * 2 },
		);

		it(
			"should return formatted historical data",
			async () => {
				service = new GetHistoricalPriceService();
				const slug = await getRealMarketSlug();
				await rateLimitDelay(500);

				const result = await service.execute(slug);
				const formatted = service.format(result);

				expect(typeof formatted).toBe("string");
				expect(formatted.length).toBeGreaterThan(0);

				expect(formatted).toContain("Historical Prices");
				expect(formatted).toContain("Data points:");

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() * 2 },
		);

		it(
			"should support different time intervals",
			async () => {
				service = new GetHistoricalPriceService();
				const slug = await getRealMarketSlug();
				await rateLimitDelay(500);

				// Test with hourly interval
				const hourlyResult = await service.execute(slug, "1h");
				await rateLimitDelay(500);

				// Test with daily interval
				const dailyResult = await service.execute(slug, "1d");

				expect(hourlyResult.history).toBeDefined();
				expect(dailyResult.history).toBeDefined();

				// Hourly should typically have more data points than daily
				// (but this may not always be true depending on market age)
				expect(Array.isArray(hourlyResult.history)).toBe(true);
				expect(Array.isArray(dailyResult.history)).toBe(true);

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() * 3 },
		);

		it(
			"should handle invalid market slug",
			async () => {
				service = new GetHistoricalPriceService();

				await expect(
					service.execute("nonexistent-market-slug-99999"),
				).rejects.toThrow();

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should have valid price values between 0 and 1",
			async () => {
				service = new GetHistoricalPriceService();
				const slug = await getRealMarketSlug();
				await rateLimitDelay(500);

				const result = await service.execute(slug);

				// Validate all price values are valid
				result.history.forEach((point) => {
					expect(point.p).toBeGreaterThanOrEqual(0);
					expect(point.p).toBeLessThanOrEqual(1);
					expect(point.t).toBeGreaterThan(0);
				});

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() * 2 },
		);

		it(
			"should have chronologically ordered timestamps",
			async () => {
				service = new GetHistoricalPriceService();
				const slug = await getRealMarketSlug();
				await rateLimitDelay(500);

				const result = await service.execute(slug);

				if (result.history.length > 1) {
					// Check that timestamps are in ascending order
					for (let i = 1; i < result.history.length; i++) {
						expect(result.history[i].t).toBeGreaterThanOrEqual(
							result.history[i - 1].t,
						);
					}
				}

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() * 2 },
		);
	},
);
