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
 * Note: API returns 404 for non-existent addresses, which is expected behavior
 *
 * To skip: SKIP_INTEGRATION_TESTS=true pnpm test:integration
 */
describe.skipIf(!shouldRunIntegrationTests())(
	"GetUserTradedVolumeService Integration",
	() => {
		setupIntegrationTests();

		let service: GetUserTradedVolumeService;

		it(
			"should return 404 for non-existent address",
			async () => {
				service = new GetUserTradedVolumeService();

				// API correctly returns 404 for addresses that don't exist
				await expect(
					service.execute("0x0000000000000000000000000000000000000000"),
				).rejects.toThrow("Profile not found");

				await rateLimitDelay();
			},
			getIntegrationTestTimeout(),
		);

		it(
			"should return 404 for fake address with no trading activity",
			async () => {
				service = new GetUserTradedVolumeService();

				// Use a random address that likely has no activity
				const randomAddress = `0x${"1".repeat(40)}`;

				await expect(service.execute(randomAddress)).rejects.toThrow(
					"Profile not found",
				);

				await rateLimitDelay();
			},
			getIntegrationTestTimeout(),
		);

		it(
			"should handle invalid address format",
			async () => {
				service = new GetUserTradedVolumeService();

				await expect(service.execute("invalid-address")).rejects.toThrow();

				await rateLimitDelay();
			},
			getIntegrationTestTimeout(),
		);

		it(
			"should validate address format before making API call",
			async () => {
				service = new GetUserTradedVolumeService();

				// Very short invalid address
				await expect(service.execute("0x123")).rejects.toThrow();

				await rateLimitDelay();
			},
			getIntegrationTestTimeout(),
		);

		it(
			"should handle empty address",
			async () => {
				service = new GetUserTradedVolumeService();

				await expect(service.execute("")).rejects.toThrow();

				await rateLimitDelay();
			},
			getIntegrationTestTimeout(),
		);
	},
);
