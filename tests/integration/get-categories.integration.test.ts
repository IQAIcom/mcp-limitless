import { describe, expect, it } from "vitest";
import { GetCategoriesService } from "../../src/services/get-categories.js";
import {
	getIntegrationTestTimeout,
	rateLimitDelay,
	setupIntegrationTests,
	shouldRunIntegrationTests,
} from "./setup.js";

/**
 * Integration tests for GetCategoriesService
 * These tests run against the real Limitless API
 *
 * To skip: SKIP_INTEGRATION_TESTS=true pnpm test:integration
 */
describe.skipIf(!shouldRunIntegrationTests())(
	"GetCategoriesService Integration",
	() => {
		setupIntegrationTests();

		let service: GetCategoriesService;

		it(
			"should get categories from the API",
			async () => {
				service = new GetCategoriesService();

				const result = await service.execute();

				// Validate response is an array
				expect(Array.isArray(result)).toBe(true);
				expect(result.length).toBeGreaterThan(0);

				// Validate structure of first category
				const firstCategory = result[0];
				expect(firstCategory).toHaveProperty("id");
				expect(firstCategory).toHaveProperty("name");
				expect(firstCategory).toHaveProperty("priority");
				expect(firstCategory).toHaveProperty("metadata");

				expect(typeof firstCategory.id).toBe("number");
				expect(typeof firstCategory.name).toBe("string");
				expect(typeof firstCategory.priority).toBe("number");
				expect(firstCategory.name.length).toBeGreaterThan(0);

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should return formatted results",
			async () => {
				service = new GetCategoriesService();

				const result = await service.execute();
				const formatted = service.format(result);

				expect(typeof formatted).toBe("string");
				expect(formatted.length).toBeGreaterThan(0);

				// Should contain key formatting elements
				expect(formatted).toContain("Limitless Categories");
				expect(formatted).toContain("Total categories:");

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should include categories with valid metadata",
			async () => {
				service = new GetCategoriesService();

				const result = await service.execute();

				result.forEach((category) => {
					// Metadata can be null or an object
					if (category.metadata !== null) {
						expect(typeof category.metadata).toBe("object");
						// Metadata properties can be null or strings
						if (category.metadata.logoUrl !== null) {
							expect(typeof category.metadata.logoUrl).toBe("string");
						}
						if (category.metadata.chatName !== null) {
							expect(typeof category.metadata.chatName).toBe("string");
						}
						if (category.metadata.coverUrl !== null) {
							expect(typeof category.metadata.coverUrl).toBe("string");
						}
					}
				});

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should include common categories",
			async () => {
				service = new GetCategoriesService();

				const result = await service.execute();

				// Find some common categories
				const categoryNames = result.map((c) => c.name);

				// These are categories commonly found on Limitless
				const commonCategories = ["Crypto", "Stocks", "Politics", "Sports"];
				const foundCategories = commonCategories.filter((name) =>
					categoryNames.includes(name),
				);

				// Expect at least some common categories to be present
				expect(foundCategories.length).toBeGreaterThan(0);

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should have valid IDs and priorities",
			async () => {
				service = new GetCategoriesService();

				const result = await service.execute();

				result.forEach((category) => {
					// IDs should be positive numbers
					expect(category.id).toBeGreaterThan(0);
					// Priorities should be numbers (can be 0 or positive)
					expect(category.priority).toBeGreaterThanOrEqual(0);
				});

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);
	},
);
