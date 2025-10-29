import { describe, expect, it } from "vitest";
import { GetMarketOrderbookService } from "../../src/services/get-market-orderbook.js";
import {
	getIntegrationTestTimeout,
	rateLimitDelay,
	setupIntegrationTests,
	shouldRunIntegrationTests,
} from "./setup.js";

/**
 * Integration tests for GetMarketOrderbookService
 * These tests run against the real Limitless API
 *
 * To skip: SKIP_INTEGRATION_TESTS=true pnpm test:integration
 */
describe.skipIf(!shouldRunIntegrationTests())(
	"GetMarketOrderbookService Integration",
	() => {
		setupIntegrationTests();

		let service: GetMarketOrderbookService;
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
			"should get orderbook for a market",
			async () => {
				service = new GetMarketOrderbookService();
				const slug = await getRealMarketSlug();
				await rateLimitDelay(500);

				const result = await service.execute(slug);

				// Validate response structure (doesn't include slug field)
				expect(result).toHaveProperty("bids");
				expect(result).toHaveProperty("asks");
				expect(result).toHaveProperty("lastTradePrice");
				expect(result).toHaveProperty("adjustedMidpoint");

				expect(Array.isArray(result.bids)).toBe(true);
				expect(Array.isArray(result.asks)).toBe(true);

				// Validate order structure if orders exist
				if (result.bids.length > 0) {
					const bid = result.bids[0];
					expect(bid).toHaveProperty("price");
					expect(bid).toHaveProperty("size");
				}

				if (result.asks.length > 0) {
					const ask = result.asks[0];
					expect(ask).toHaveProperty("price");
					expect(ask).toHaveProperty("size");
				}

				await rateLimitDelay();
			},
			getIntegrationTestTimeout() * 2,
		);

		it(
			"should return formatted orderbook",
			async () => {
				service = new GetMarketOrderbookService();
				const slug = await getRealMarketSlug();
				await rateLimitDelay(500);

				const result = await service.execute(slug);
				const formatted = service.format(result);

				expect(typeof formatted).toBe("string");
				expect(formatted.length).toBeGreaterThan(0);

				expect(formatted).toContain("Orderbook");
				expect(formatted).toContain("Asks");
				expect(formatted).toContain("Bids");

				await rateLimitDelay();
			},
			getIntegrationTestTimeout() * 2,
		);

		it(
			"should handle market with no orders",
			async () => {
				service = new GetMarketOrderbookService();
				const slug = await getRealMarketSlug();
				await rateLimitDelay(500);

				const result = await service.execute(slug);
				const formatted = service.format(result);

				// Should handle empty orderbook gracefully
				if (result.bids.length === 0 && result.asks.length === 0) {
					expect(formatted).toContain("No");
				}

				await rateLimitDelay();
			},
			getIntegrationTestTimeout() * 2,
		);

		it(
			"should handle invalid market slug",
			async () => {
				service = new GetMarketOrderbookService();

				await expect(
					service.execute("nonexistent-market-slug-99999"),
				).rejects.toThrow();

				await rateLimitDelay();
			},
			getIntegrationTestTimeout(),
		);

		it(
			"should have valid price and size values",
			async () => {
				service = new GetMarketOrderbookService();
				const slug = await getRealMarketSlug();
				await rateLimitDelay(500);

				const result = await service.execute(slug);

				// Validate bid prices and sizes
				result.bids.forEach((bid) => {
					expect(typeof bid.price).toBe("number");
					expect(typeof bid.size).toBe("number");
					expect(bid.price).toBeGreaterThan(0);
					expect(bid.price).toBeLessThanOrEqual(1);
					expect(bid.size).toBeGreaterThan(0);
				});

				// Validate ask prices and sizes
				result.asks.forEach((ask) => {
					expect(typeof ask.price).toBe("number");
					expect(typeof ask.size).toBe("number");
					expect(ask.price).toBeGreaterThan(0);
					expect(ask.price).toBeLessThanOrEqual(1);
					expect(ask.size).toBeGreaterThan(0);
				});

				await rateLimitDelay();
			},
			getIntegrationTestTimeout() * 2,
		);
	},
);
