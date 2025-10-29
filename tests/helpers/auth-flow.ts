/**
 * Authentication flow helper for integration tests
 * Manages the complete authentication flow: get signing message -> sign -> login
 */

import { AuthLoginService } from "../../src/services/auth-login.js";
import { AuthLogoutService } from "../../src/services/auth-logout.js";
import { AuthSigningMessageService } from "../../src/services/auth-signing-message.js";
import type { TestWallet } from "./wallet.js";

/**
 * Authenticated session data
 */
export interface AuthSession {
	account: string;
	token?: string;
	signingMessage: string;
	signature: string;
}

/**
 * Perform complete authentication flow
 * Returns the authenticated session data
 */
export async function authenticateTestWallet(
	wallet: TestWallet,
	userData?: {
		name?: string;
		email?: string;
		[key: string]: any;
	},
): Promise<AuthSession> {
	// Step 1: Get signing message
	const signingMessageService = new AuthSigningMessageService();
	const { message, nonce } = await signingMessageService.execute(
		wallet.address,
	);

	// Step 2: Sign the message
	const signature = await wallet.signMessage(message);

	// Step 3: Login with signed message
	const loginService = new AuthLoginService();
	const loginResponse = await loginService.execute({
		account: wallet.address,
		signingMessage: message,
		signature: signature,
		userData: {
			client: "eoa", // Externally Owned Account
			...userData,
		},
	});

	return {
		account: wallet.address,
		token: loginResponse.token,
		signingMessage: message,
		signature: signature,
	};
}

/**
 * Logout an authenticated session
 */
export async function logoutSession(): Promise<void> {
	const logoutService = new AuthLogoutService();
	await logoutService.execute();
}

/**
 * Helper to perform authenticated test
 * Authenticates, runs the test, then logs out
 */
export async function withAuthenticatedSession<T>(
	wallet: TestWallet,
	testFn: (session: AuthSession) => Promise<T>,
): Promise<T> {
	// Authenticate
	const session = await authenticateTestWallet(wallet);

	try {
		// Run test
		return await testFn(session);
	} finally {
		// Cleanup: logout
		try {
			await logoutSession();
		} catch (error) {
			// Ignore logout errors in cleanup
			console.warn("Warning: Failed to logout in test cleanup:", error);
		}
	}
}
