import { describe, expect, it } from "vitest";
import { GetUserProfileService } from "../../src/services/get-user-profile.js";
import { authenticateTestWallet, logoutSession } from "../helpers/auth-flow.js";
import { createTestWallet } from "../helpers/wallet.js";
import {
	getIntegrationTestTimeout,
	rateLimitDelay,
	setupIntegrationTests,
	shouldRunIntegrationTests,
} from "./setup.js";

/**
 * Integration tests for GetUserProfileService
 * These tests run against the real Limitless API
 *
 * Tests the undocumented /profiles/{address} endpoint
 * This endpoint requires authentication.
 *
 * To skip: SKIP_INTEGRATION_TESTS=true pnpm test:integration
 */
describe.skipIf(!shouldRunIntegrationTests())(
	"GetUserProfileService Integration",
	() => {
		setupIntegrationTests();

		// Known user address that likely has a profile
		const KNOWN_USER_ADDRESS = "0x9fEAB70f3c4a944B97b7565BAc4991dF5B7A69ff";

		it(
			"should require authentication to fetch profile",
			async () => {
				const service = new GetUserProfileService();

				// Should fail without authentication
				await expect(service.execute(KNOWN_USER_ADDRESS)).rejects.toThrow(
					"Authentication required",
				);

				await rateLimitDelay();
			},
			getIntegrationTestTimeout() * 2,
		);

		it(
			"should fetch profile for authenticated user's own address",
			async () => {
				const wallet = createTestWallet();
				const service = new GetUserProfileService();

				try {
					// Authenticate
					await authenticateTestWallet(wallet);
					await rateLimitDelay();

					// Try to fetch own profile
					const profile = await service.execute(wallet.address);

					expect(profile).toBeDefined();
					expect(profile.account.toLowerCase()).toBe(
						wallet.address.toLowerCase(),
					);

					console.log(
						"Own profile response:",
						JSON.stringify(profile, null, 2),
					);

					await rateLimitDelay();
				} catch (error: any) {
					console.error("Error fetching own profile:", error.message);
					// 404 is acceptable if the user hasn't set up a profile
					if (!error.message.includes("404")) {
						throw error;
					}
				} finally {
					// Cleanup
					await logoutSession();
					await rateLimitDelay();
				}
			},
			getIntegrationTestTimeout() * 4,
		);

		it(
			"should handle non-existent user profile gracefully",
			async () => {
				const service = new GetUserProfileService();
				// Use an address that likely doesn't have a profile
				const nonExistentAddress = "0x0000000000000000000000000000000000000001";

				await expect(service.execute(nonExistentAddress)).rejects.toThrow();

				await rateLimitDelay();
			},
			getIntegrationTestTimeout() * 2,
		);

		it(
			"should handle invalid address format",
			async () => {
				const service = new GetUserProfileService();

				// Invalid address format
				await expect(service.execute("invalid-address")).rejects.toThrow();

				await rateLimitDelay();
			},
			getIntegrationTestTimeout(),
		);

		it(
			"should format profile response correctly",
			async () => {
				const service = new GetUserProfileService();

				// Test formatting with mock data
				const mockProfile = {
					id: 12345,
					account: "0x1234567890123456789012345678901234567890",
					username: "testuser",
					displayName: "Test User",
					bio: "Test bio description",
					client: "eoa",
					pfpUrl: "https://example.com/avatar.png",
					smartWallet: null,
					isCreator: false,
					isOnboarded: true,
					isAdmin: false,
					socialUrl: null,
					hasTraded: true,
					referralCode: "TEST123",
					mode: "advanced",
					tradeWalletOption: null,
					tradeWalletChoosen: false,
					embeddedAccount: null,
					rank: {
						id: 1,
						name: "Bronze",
						feeRateBps: 300,
					},
					points: 1000,
					accumulativePoints: 5000,
					isTop100: false,
					referralData: [],
					enrolledInPointsProgram: true,
					leaderboardPosition: 500,
					referredUsersCount: 5,
				};

				const formatted = service.format(mockProfile);

				expect(typeof formatted).toBe("string");
				expect(formatted).toContain("USER PROFILE");
				expect(formatted).toContain(
					"0x1234567890123456789012345678901234567890",
				);
				expect(formatted).toContain("Username: testuser");
				expect(formatted).toContain("Display Name: Test User");
				expect(formatted).toContain("Bio: Test bio description");
				expect(formatted).toContain(
					"Profile Picture: https://example.com/avatar.png",
				);
				expect(formatted).toContain("Points: 1,000");
				expect(formatted).toContain("Rank: Bronze");
				expect(formatted).toContain("Leaderboard Position: #500");
			},
			getIntegrationTestTimeout(),
		);
	},
);
