import { expect } from "vitest";

/**
 * Common test utilities and assertions
 */

/**
 * Assert that a string contains expected substrings
 */
export function assertContainsAll(
	actual: string,
	expectedSubstrings: string[],
) {
	for (const substring of expectedSubstrings) {
		expect(actual).toContain(substring);
	}
}

/**
 * Assert that an error message matches expected pattern
 */
export function assertErrorMessage(error: unknown, expectedMessage: string) {
	expect(error).toBeInstanceOf(Error);
	expect((error as Error).message).toContain(expectedMessage);
}

/**
 * Assert that a formatted output contains market information
 */
export function assertMarketOutput(output: string, market: any) {
	assertContainsAll(output, [
		market.question,
		market.slug,
		`limitless.exchange/markets/${market.slug}`,
	]);
}

/**
 * Assert that output contains no results message
 */
export function assertNoResults(output: string) {
	expect(output.toLowerCase()).toMatch(/no.*found|empty|not found/i);
}

/**
 * Create a mock service for testing
 */
export function createMockService<T>(
	serviceName: string,
	methods: Partial<T>,
): T {
	return methods as T;
}

/**
 * Wait for a promise to reject with specific error
 */
export async function expectToReject(
	promise: Promise<any>,
	errorMessage?: string,
) {
	try {
		await promise;
		throw new Error("Expected promise to reject but it resolved");
	} catch (error) {
		if (errorMessage) {
			assertErrorMessage(error, errorMessage);
		}
		return error;
	}
}

/**
 * Assert that an object matches expected shape (useful for API responses)
 */
export function assertResponseShape(actual: any, expectedKeys: string[]) {
	for (const key of expectedKeys) {
		expect(actual).toHaveProperty(key);
	}
}

/**
 * Generate test market data
 */
export function generateTestMarket(overrides: Partial<any> = {}) {
	return {
		question: "Test market question?",
		slug: "test-market-slug",
		category: "Test Category",
		volume: "10000",
		liquidity: "5000",
		endDate: "2024-12-31T23:59:59Z",
		...overrides,
	};
}

/**
 * Generate test user address
 */
export function generateTestAddress(suffix = "1234"): string {
	return `0x${"0".repeat(36)}${suffix}`;
}

/**
 * Format date for testing (consistent format)
 */
export function formatTestDate(date: Date | string): string {
	return new Date(date).toISOString();
}
