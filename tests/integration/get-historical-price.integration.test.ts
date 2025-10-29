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
				"https://api.limitless.exchange/markets/active/slugs",
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

				// Service takes params object: {slug, from?, to?, interval?}
				const result = await service.execute({ slug });

				// Validate response is an array
				expect(Array.isArray(result)).toBe(true);

				// If history exists, validate structure
				if (result.length > 0) {
					const dataPoint = result[0];
					expect(dataPoint).toHaveProperty("timestamp");
					expect(dataPoint).toHaveProperty("price");

					expect(typeof dataPoint.timestamp).toBe("string");
					expect(typeof dataPoint.price).toBe("number");
				}

				await rateLimitDelay();
			},
			getIntegrationTestTimeout() * 2,
		);

		it(
			"should return formatted historical data",
			async () => {
				service = new GetHistoricalPriceService();
				const slug = await getRealMarketSlug();
				await rateLimitDelay(500);

				const result = await service.execute({ slug });
				// format() requires both result and slug
				const formatted = service.format(result, slug);

				expect(typeof formatted).toBe("string");
				expect(formatted.length).toBeGreaterThan(0);

				await rateLimitDelay();
			},
			getIntegrationTestTimeout() * 2,
		);

		it(
			"should support different time intervals",
			async () => {
				service = new GetHistoricalPriceService();
				const slug = await getRealMarketSlug();
				await rateLimitDelay(500);

				// Test with hourly interval
				const hourlyResult = await service.execute({ slug, interval: "1h" });

				expect(Array.isArray(hourlyResult)).toBe(true);

				await rateLimitDelay();
			},
			getIntegrationTestTimeout() * 2,
		);

		it(
			"should handle invalid market slug",
			async () => {
				service = new GetHistoricalPriceService();

				await expect(
					service.execute({ slug: "nonexistent-market-slug-99999" }),
				).rejects.toThrow();

				await rateLimitDelay();
			},
			getIntegrationTestTimeout(),
		);

		it(
			"should have valid price values between 0 and 1",
			async () => {
				service = new GetHistoricalPriceService();
				const slug = await getRealMarketSlug();
				await rateLimitDelay(500);

				const result = await service.execute({ slug });

				// Validate all price values are valid
				result.forEach((point) => {
					expect(point.price).toBeGreaterThanOrEqual(0);
					expect(point.price).toBeLessThanOrEqual(1);
					expect(point.timestamp).toBeTruthy();
				});

				await rateLimitDelay();
			},
			getIntegrationTestTimeout() * 2,
		);
	},
);
