import { describe, expect, it } from "vitest";
import { client } from "../../src/lib/client.js";
import { AuthLoginService } from "../../src/services/auth-login.js";
import { AuthLogoutService } from "../../src/services/auth-logout.js";
import { AuthSigningMessageService } from "../../src/services/auth-signing-message.js";
import { AuthVerifyService } from "../../src/services/auth-verify.js";
import { GetPortfolioPositionsService } from "../../src/services/get-portfolio-positions.js";
import { createTestWallet } from "../helpers/wallet.js";
import {
	getIntegrationTestTimeout,
	rateLimitDelay,
	setupIntegrationTests,
	shouldRunIntegrationTests,
} from "./setup.js";

/**
 * Complete Authentication Flow Integration Test
 *
 * This test proves that the session-based authentication system works end-to-end:
 * 1. Login with wallet signature → Session cookie is stored
 * 2. Verify authentication → Session cookie is validated
 * 3. Access private endpoint → Session cookie is automatically sent
 * 4. Check auth status → Session is still valid
 * 5. Logout → Session cookie is cleared
 * 6. Verify logged out → Session no longer valid
 *
 * This validates the SessionManager's cookie handling functionality.
 *
 * To skip: SKIP_INTEGRATION_TESTS=true pnpm test:integration
 */
describe.skipIf(!shouldRunIntegrationTests())(
	"Complete Authentication Flow Integration",
	() => {
		setupIntegrationTests();

		it(
			"should complete full authentication flow: login -> verify -> use private endpoint -> logout",
			{ timeout: getIntegrationTestTimeout() * 8 }, // Extended timeout for multiple API calls
			async () => {
				const wallet = createTestWallet();

				// ============================================
				// Step 1: Get signing message
				// ============================================
				const signingMessageService = new AuthSigningMessageService();
				const { message } = await signingMessageService.execute(wallet.address);

				expect(message).toBeTruthy();
				expect(typeof message).toBe("string");

				await rateLimitDelay();

				// ============================================
				// Step 2: Sign the message with wallet
				// ============================================
				const signature = await wallet.signMessage(message);

				expect(signature).toBeTruthy();
				expect(signature).toMatch(/^0x[a-fA-F0-9]{130}$/); // Valid signature format

				// ============================================
				// Step 3: Login with signed message
				// ============================================
				const loginService = new AuthLoginService();
				const loginResponse = await loginService.execute({
					account: wallet.address,
					signingMessage: message,
					signature: signature,
					userData: {
						client: "eoa",
					},
				});

				expect(loginResponse).toHaveProperty("account");
				expect(loginResponse.account.toLowerCase()).toBe(
					wallet.address.toLowerCase(),
				);

				// Verify session cookie was stored
				const isAuthenticatedAfterLogin = await client.isAuthenticated();
				expect(isAuthenticatedAfterLogin).toBe(true);

				await rateLimitDelay();

				// ============================================
				// Step 4: Verify authentication
				// ============================================
				const verifyService = new AuthVerifyService();
				const verifiedAddress = await verifyService.execute();

				expect(typeof verifiedAddress).toBe("string");
				expect(verifiedAddress.toLowerCase()).toBe(
					wallet.address.toLowerCase(),
				);

				await rateLimitDelay();

				// ============================================
				// Step 5: Verify session with client method
				// ============================================
				const sessionAddress = await client.verifySession();

				expect(sessionAddress).toBeTruthy();
				expect(sessionAddress?.toLowerCase()).toBe(
					wallet.address.toLowerCase(),
				);

				await rateLimitDelay();

				// ============================================
				// Step 6: Access private endpoint (portfolio positions)
				// ============================================
				// This proves the session cookie is automatically sent with requests
				const portfolioService = new GetPortfolioPositionsService();

				// Should NOT throw unauthorized error because we're authenticated
				const portfolioResponse = await portfolioService.execute();

				// The key test is that it doesn't throw "Unauthorized" error
				// The response structure may vary, but it should be defined
				expect(portfolioResponse).toBeDefined();
				expect(typeof portfolioResponse).toBe("object");
				// Note: Portfolio might be empty for new wallet, but the call should succeed

				await rateLimitDelay();

				// ============================================
				// Step 7: Verify auth status still valid
				// ============================================
				const stillAuthenticated = await client.isAuthenticated();
				expect(stillAuthenticated).toBe(true);

				const stillVerified = await client.verifySession();
				expect(stillVerified?.toLowerCase()).toBe(wallet.address.toLowerCase());

				await rateLimitDelay();

				// ============================================
				// Step 8: Logout
				// ============================================
				const logoutService = new AuthLogoutService();
				await logoutService.execute();

				// Session cookie should be cleared
				const isAuthenticatedAfterLogout = await client.isAuthenticated();
				expect(isAuthenticatedAfterLogout).toBe(false);

				await rateLimitDelay();

				// ============================================
				// Step 9: Verify cannot access private endpoint after logout
				// ============================================
				await expect(portfolioService.execute()).rejects.toThrow(
					"Unauthorized",
				);

				await rateLimitDelay();

				// ============================================
				// Step 10: Verify auth verification fails after logout
				// ============================================
				await expect(verifyService.execute()).rejects.toThrow(
					"Not authenticated",
				);

				await rateLimitDelay();

				// ============================================
				// Step 11: Verify session is null after logout
				// ============================================
				const sessionAfterLogout = await client.verifySession();
				expect(sessionAfterLogout).toBeNull();
			},
		);

		it(
			"should handle multiple sequential login/logout cycles",
			{ timeout: getIntegrationTestTimeout() * 10 },
			async () => {
				const wallet = createTestWallet();
				const loginService = new AuthLoginService();
				const logoutService = new AuthLogoutService();
				const signingMessageService = new AuthSigningMessageService();
				const portfolioService = new GetPortfolioPositionsService();

				// First cycle
				const { message: message1 } = await signingMessageService.execute(
					wallet.address,
				);
				await rateLimitDelay();

				const signature1 = await wallet.signMessage(message1);
				await loginService.execute({
					account: wallet.address,
					signingMessage: message1,
					signature: signature1,
					userData: { client: "eoa" },
				});
				await rateLimitDelay();

				// Verify first login works
				expect(await client.isAuthenticated()).toBe(true);
				await expect(portfolioService.execute()).resolves.toBeDefined();
				await rateLimitDelay();

				// Logout from first session
				await logoutService.execute();
				await rateLimitDelay();
				expect(await client.isAuthenticated()).toBe(false);

				// Second cycle
				const { message: message2 } = await signingMessageService.execute(
					wallet.address,
				);
				await rateLimitDelay();

				const signature2 = await wallet.signMessage(message2);
				await loginService.execute({
					account: wallet.address,
					signingMessage: message2,
					signature: signature2,
					userData: { client: "eoa" },
				});
				await rateLimitDelay();

				// Verify second login works
				expect(await client.isAuthenticated()).toBe(true);
				await expect(portfolioService.execute()).resolves.toBeDefined();
				await rateLimitDelay();

				// Cleanup
				await logoutService.execute();
				await rateLimitDelay();
			},
		);

		it(
			"should maintain session across multiple private endpoint calls",
			{ timeout: getIntegrationTestTimeout() * 6 },
			async () => {
				const wallet = createTestWallet();
				const loginService = new AuthLoginService();
				const logoutService = new AuthLogoutService();
				const signingMessageService = new AuthSigningMessageService();
				const portfolioService = new GetPortfolioPositionsService();

				// Login
				const { message } = await signingMessageService.execute(wallet.address);
				await rateLimitDelay();

				const signature = await wallet.signMessage(message);
				await loginService.execute({
					account: wallet.address,
					signingMessage: message,
					signature: signature,
					userData: { client: "eoa" },
				});
				await rateLimitDelay();

				// Make multiple calls - session should persist
				await expect(portfolioService.execute()).resolves.toBeDefined();
				await rateLimitDelay();

				await expect(portfolioService.execute()).resolves.toBeDefined();
				await rateLimitDelay();

				await expect(portfolioService.execute()).resolves.toBeDefined();
				await rateLimitDelay();

				// Verify still authenticated
				expect(await client.isAuthenticated()).toBe(true);
				expect(await client.verifySession()).toBeTruthy();

				// Cleanup
				await logoutService.execute();
				await rateLimitDelay();
			},
		);
	},
);
