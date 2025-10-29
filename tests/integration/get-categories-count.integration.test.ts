import { describe, expect, it } from "vitest";
import { GetCategoriesCountService } from "../../src/services/get-categories-count.js";
import {
	getIntegrationTestTimeout,
	rateLimitDelay,
	setupIntegrationTests,
	shouldRunIntegrationTests,
} from "./setup.js";

/**
 * Integration tests for GetCategoriesCountService
 * These tests run against the real Limitless API
 *
 * To skip: SKIP_INTEGRATION_TESTS=true pnpm test:integration
 */
describe.skipIf(!shouldRunIntegrationTests())(
	"GetCategoriesCountService Integration",
	() => {
		setupIntegrationTests();

		let service: GetCategoriesCountService;

		it(
			"should get category counts from the API",
			async () => {
				service = new GetCategoriesCountService();

				const result = await service.execute();

				// Validate response is an array
				expect(Array.isArray(result)).toBe(true);

				// If categories are found, validate structure
				if (result.length > 0) {
					const firstCategory = result[0];
					expect(firstCategory).toHaveProperty("categoryId");
					expect(firstCategory).toHaveProperty("count");

					expect(typeof firstCategory.categoryId).toBe("string");
					expect(typeof firstCategory.count).toBe("number");
					expect(firstCategory.count).toBeGreaterThanOrEqual(0);
				}

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should return formatted results",
			async () => {
				service = new GetCategoriesCountService();

				const result = await service.execute();
				const formatted = service.format(result);

				expect(typeof formatted).toBe("string");
				expect(formatted.length).toBeGreaterThan(0);

				// Should contain key formatting elements
				expect(formatted).toContain("Market Categories");

				if (result.length > 0) {
					expect(formatted).toContain("Total categories:");
				}

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should return categories with non-negative counts",
			async () => {
				service = new GetCategoriesCountService();

				const result = await service.execute();

				result.forEach((category) => {
					expect(category.count).toBeGreaterThanOrEqual(0);
				});

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should include common category IDs",
			async () => {
				service = new GetCategoriesCountService();

				const result = await service.execute();

				// Verify result has some categories
				expect(result.length).toBeGreaterThan(0);

				// All categories should have valid IDs
				result.forEach((category) => {
					expect(category.categoryId).toBeTruthy();
					expect(category.categoryId.length).toBeGreaterThan(0);
				});

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);
	},
);
