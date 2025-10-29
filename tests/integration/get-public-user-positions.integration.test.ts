import { describe, expect, it } from "vitest";
import { GetPublicUserPositionsService } from "../../src/services/get-public-user-positions.js";
import {
	getIntegrationTestTimeout,
	rateLimitDelay,
	setupIntegrationTests,
	shouldRunIntegrationTests,
} from "./setup.js";

/**
 * Integration tests for GetPublicUserPositionsService
 * These tests run against the real Limitless API
 *
 * To skip: SKIP_INTEGRATION_TESTS=true pnpm test:integration
 */
describe.skipIf(!shouldRunIntegrationTests())(
	"GetPublicUserPositionsService Integration",
	() => {
		setupIntegrationTests();

		let service: GetPublicUserPositionsService;

		// Use a well-known test address
		const testAddress = "0x0000000000000000000000000000000000000000";

		it(
			"should get user positions",
			async () => {
				service = new GetPublicUserPositionsService();

				const result = await service.execute(testAddress);

				// Validate response structure
				expect(result).toHaveProperty("account");
				expect(result).toHaveProperty("positions");

				expect(typeof result.account).toBe("string");
				expect(Array.isArray(result.positions)).toBe(true);

				// If positions exist, validate structure
				if (result.positions.length > 0) {
					const position = result.positions[0];
					expect(position).toHaveProperty("market");
					expect(typeof position.market).toBe("object");
				}

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should return formatted positions",
			async () => {
				service = new GetPublicUserPositionsService();

				const result = await service.execute(testAddress);
				const formatted = service.format(result);

				expect(typeof formatted).toBe("string");
				expect(formatted.length).toBeGreaterThan(0);

				expect(formatted).toContain("User Positions");
				expect(formatted).toContain("Account:");
				expect(formatted).toContain("Total positions:");

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should handle address with no positions",
			async () => {
				service = new GetPublicUserPositionsService();

				// Use a random address that likely has no positions
				const randomAddress = `0x${"1".repeat(40)}`;

				const result = await service.execute(randomAddress);

				expect(result.account).toBe(randomAddress);
				expect(Array.isArray(result.positions)).toBe(true);

				const formatted = service.format(result);
				if (result.positions.length === 0) {
					expect(formatted).toContain("No positions");
				}

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should handle invalid address format",
			async () => {
				service = new GetPublicUserPositionsService();

				await expect(service.execute("invalid-address")).rejects.toThrow();

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should validate position structure",
			async () => {
				service = new GetPublicUserPositionsService();

				const result = await service.execute(testAddress);

				result.positions.forEach((position) => {
					expect(position.market).toBeDefined();
					expect(typeof position.market).toBe("object");
				});

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);
	},
);
