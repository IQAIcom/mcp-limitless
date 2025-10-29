import { describe, expect, it } from "vitest";
import { GetActiveSlugsService } from "../../src/services/get-active-slugs.js";
import {
	getIntegrationTestTimeout,
	rateLimitDelay,
	setupIntegrationTests,
	shouldRunIntegrationTests,
} from "./setup.js";

/**
 * Integration tests for GetActiveSlugsService
 * These tests run against the real Limitless API
 *
 * To skip: SKIP_INTEGRATION_TESTS=true pnpm test:integration
 */
describe.skipIf(!shouldRunIntegrationTests())(
	"GetActiveSlugsService Integration",
	() => {
		setupIntegrationTests();

		let service: GetActiveSlugsService;

		it(
			"should get active slugs from the API",
			async () => {
				service = new GetActiveSlugsService();

				// Service takes no parameters and returns all slugs
				const result = await service.execute();

				// Validate response is an array
				expect(Array.isArray(result)).toBe(true);

				// If slugs are found, validate structure
				if (result.length > 0) {
					const firstSlug = result[0];
					expect(firstSlug).toHaveProperty("slug");
					expect(typeof firstSlug.slug).toBe("string");

					// Optional fields
					if (firstSlug.ticker) {
						expect(typeof firstSlug.ticker).toBe("string");
					}
					if (firstSlug.strikePrice) {
						expect(typeof firstSlug.strikePrice).toBe("string");
					}
					if (firstSlug.deadline) {
						expect(typeof firstSlug.deadline).toBe("string");
					}
				}

				await rateLimitDelay();
			},
			getIntegrationTestTimeout(),
		);

		it(
			"should return formatted results",
			async () => {
				service = new GetActiveSlugsService();

				const result = await service.execute();
				const formatted = service.format(result);

				expect(typeof formatted).toBe("string");
				expect(formatted.length).toBeGreaterThan(0);

				// Should contain key formatting elements
				if (result.length > 0) {
					expect(formatted).toContain("Active Market Slugs");
					expect(formatted).toContain("Total:");
				}

				await rateLimitDelay();
			},
			getIntegrationTestTimeout(),
		);

		it(
			"should return multiple market slugs",
			async () => {
				service = new GetActiveSlugsService();

				const result = await service.execute();

				// API returns all active slugs
				expect(result.length).toBeGreaterThan(0);

				await rateLimitDelay();
			},
			getIntegrationTestTimeout(),
		);

		it(
			"should return valid slugs that can be used to fetch market details",
			async () => {
				service = new GetActiveSlugsService();

				const result = await service.execute();

				if (result.length > 0) {
					const slug = result[0].slug;

					// Verify we can fetch market details with this slug
					const response = await fetch(
						`https://api.limitless.exchange/markets/${slug}`,
					);

					expect(response.ok).toBe(true);

					const market = await response.json();
					expect(market).toHaveProperty("slug");
					expect(market.slug).toBe(slug);
				}

				await rateLimitDelay();
			},
			getIntegrationTestTimeout() * 2,
		);
	},
);
