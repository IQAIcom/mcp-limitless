import { describe, expect, it } from "vitest";
import { GetMarketEventsService } from "../../src/services/get-market-events.js";
import {
	getIntegrationTestTimeout,
	rateLimitDelay,
	setupIntegrationTests,
	shouldRunIntegrationTests,
} from "./setup.js";

/**
 * Integration tests for GetMarketEventsService
 * These tests run against the real Limitless API
 *
 * To skip: SKIP_INTEGRATION_TESTS=true pnpm test:integration
 */
describe.skipIf(!shouldRunIntegrationTests())(
	"GetMarketEventsService Integration",
	() => {
		setupIntegrationTests();

		let service: GetMarketEventsService;
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
			"should get market events",
			async () => {
				service = new GetMarketEventsService();
				const slug = await getRealMarketSlug();
				await rateLimitDelay(500);

				// Service takes params object: {slug, page?, limit?}
				const result = await service.execute({ slug });

				// Validate response structure
				expect(result).toHaveProperty("events");

				expect(Array.isArray(result.events)).toBe(true);

				// If events exist, validate structure
				if (result.events.length > 0) {
					const event = result.events[0];
					expect(event).toHaveProperty("type");
					expect(event).toHaveProperty("timestamp");
					expect(typeof event.type).toBe("string");
					expect(typeof event.timestamp).toBe("string");
				}

				await rateLimitDelay();
			},
			getIntegrationTestTimeout() * 2,
		);

		it(
			"should return formatted market events",
			async () => {
				service = new GetMarketEventsService();
				const slug = await getRealMarketSlug();
				await rateLimitDelay(500);

				const result = await service.execute({ slug });
				// format() requires both response and slug
				const formatted = service.format(result, slug);

				expect(typeof formatted).toBe("string");
				expect(formatted.length).toBeGreaterThan(0);

				await rateLimitDelay();
			},
			getIntegrationTestTimeout() * 2,
		);

		it(
			"should support limit parameter",
			async () => {
				service = new GetMarketEventsService();
				const slug = await getRealMarketSlug();
				await rateLimitDelay(500);

				const result = await service.execute({ slug, limit: 5 });

				expect(result.events.length).toBeLessThanOrEqual(5);

				await rateLimitDelay();
			},
			getIntegrationTestTimeout() * 2,
		);

		it(
			"should handle market with no events gracefully",
			async () => {
				service = new GetMarketEventsService();
				const slug = await getRealMarketSlug();
				await rateLimitDelay(500);

				const result = await service.execute({ slug });
				const formatted = service.format(result, slug);

				// Should handle empty events gracefully
				expect(formatted).toBeDefined();
				expect(typeof formatted).toBe("string");

				await rateLimitDelay();
			},
			getIntegrationTestTimeout() * 2,
		);

		it(
			"should handle invalid market slug",
			async () => {
				service = new GetMarketEventsService();

				// API returns 404 for invalid slug, which is expected
				await expect(
					service.execute({
						slug: "nonexistent-market-slug-99999",
					}),
				).rejects.toThrow();

				await rateLimitDelay();
			},
			getIntegrationTestTimeout(),
		);
	},
);
