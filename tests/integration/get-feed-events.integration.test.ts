import { describe, expect, it } from "vitest";
import { GetFeedEventsService } from "../../src/services/get-feed-events.js";
import {
	getIntegrationTestTimeout,
	rateLimitDelay,
	setupIntegrationTests,
	shouldRunIntegrationTests,
} from "./setup.js";

/**
 * Integration tests for GetFeedEventsService
 * These tests run against the real Limitless API
 *
 * To skip: SKIP_INTEGRATION_TESTS=true pnpm test:integration
 */
describe.skipIf(!shouldRunIntegrationTests())(
	"GetFeedEventsService Integration",
	() => {
		setupIntegrationTests();

		let service: GetFeedEventsService;
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
			"should get feed events for a market",
			async () => {
				service = new GetFeedEventsService();
				const slug = await getRealMarketSlug();
				await rateLimitDelay(500);

				const result = await service.execute(slug);

				// Validate response structure
				expect(result).toHaveProperty("slug");
				expect(result).toHaveProperty("events");

				expect(result.slug).toBe(slug);
				expect(Array.isArray(result.events)).toBe(true);

				// If events exist, validate structure
				if (result.events.length > 0) {
					const event = result.events[0];
					expect(event).toHaveProperty("type");
					expect(typeof event.type).toBe("string");
				}

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() * 2 },
		);

		it(
			"should return formatted feed events",
			async () => {
				service = new GetFeedEventsService();
				const slug = await getRealMarketSlug();
				await rateLimitDelay(500);

				const result = await service.execute(slug);
				const formatted = service.format(result);

				expect(typeof formatted).toBe("string");
				expect(formatted.length).toBeGreaterThan(0);

				expect(formatted).toContain("Feed Events");
				expect(formatted).toContain("Total events:");

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() * 2 },
		);

		it(
			"should handle market with no events",
			async () => {
				service = new GetFeedEventsService();
				const slug = await getRealMarketSlug();
				await rateLimitDelay(500);

				const result = await service.execute(slug);
				const formatted = service.format(result);

				// Should handle empty events gracefully
				if (result.events.length === 0) {
					expect(formatted).toContain("No events");
				}

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() * 2 },
		);

		it(
			"should handle invalid market slug",
			async () => {
				service = new GetFeedEventsService();

				await expect(
					service.execute("nonexistent-market-slug-99999"),
				).rejects.toThrow();

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);
	},
);
