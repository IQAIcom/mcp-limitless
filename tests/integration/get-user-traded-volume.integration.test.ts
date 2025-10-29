import { describe, expect, it } from "vitest";
import { GetUserTradedVolumeService } from "../../src/services/get-user-traded-volume.js";
import {
	getIntegrationTestTimeout,
	rateLimitDelay,
	setupIntegrationTests,
	shouldRunIntegrationTests,
} from "./setup.js";

/**
 * Integration tests for GetUserTradedVolumeService
 * These tests run against the real Limitless API
 *
 * To skip: SKIP_INTEGRATION_TESTS=true pnpm test:integration
 */
describe.skipIf(!shouldRunIntegrationTests())(
	"GetUserTradedVolumeService Integration",
	() => {
		setupIntegrationTests();

		let service: GetUserTradedVolumeService;

		// Use a well-known test address
		const testAddress = "0x0000000000000000000000000000000000000000";

		it(
			"should get user traded volume",
			async () => {
				service = new GetUserTradedVolumeService();

				const result = await service.execute(testAddress);

				// Validate response structure
				expect(result).toHaveProperty("account");
				expect(result).toHaveProperty("volumeFormatted");

				expect(typeof result.account).toBe("string");
				expect(typeof result.volumeFormatted).toBe("string");

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should return formatted volume",
			async () => {
				service = new GetUserTradedVolumeService();

				const result = await service.execute(testAddress);
				const formatted = service.format(result);

				expect(typeof formatted).toBe("string");
				expect(formatted.length).toBeGreaterThan(0);

				expect(formatted).toContain("Trading Volume");
				expect(formatted).toContain("Account:");
				expect(formatted).toContain("Total Volume:");

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should handle address with no trading activity",
			async () => {
				service = new GetUserTradedVolumeService();

				// Use a random address that likely has no activity
				const randomAddress = `0x${"1".repeat(40)}`;

				const result = await service.execute(randomAddress);

				expect(result.account).toBe(randomAddress);
				expect(result.volumeFormatted).toBeDefined();

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should handle invalid address format",
			async () => {
				service = new GetUserTradedVolumeService();

				await expect(service.execute("invalid-address")).rejects.toThrow();

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should return non-negative volume",
			async () => {
				service = new GetUserTradedVolumeService();

				const result = await service.execute(testAddress);

				// Volume should be a valid formatted string
				expect(result.volumeFormatted).toBeTruthy();
				expect(typeof result.volumeFormatted).toBe("string");

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);
	},
);
