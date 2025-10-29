import { describe, expect, it } from "vitest";
import { AuthLoginService } from "../../src/services/auth-login.js";
import { AuthSigningMessageService } from "../../src/services/auth-signing-message.js";
import { authenticateTestWallet } from "../helpers/auth-flow.js";
import { createTestWallet } from "../helpers/wallet.js";
import {
	getIntegrationTestTimeout,
	rateLimitDelay,
	setupIntegrationTests,
	shouldRunIntegrationTests,
} from "./setup.js";

/**
 * Integration tests for AuthLoginService
 * These tests run against the real Limitless API
 *
 * Includes both real authentication flows with wallet signatures
 * and error handling tests for invalid inputs.
 *
 * To skip: SKIP_INTEGRATION_TESTS=true pnpm test:integration
 */
describe.skipIf(!shouldRunIntegrationTests())(
	"AuthLoginService Integration",
	() => {
		setupIntegrationTests();

		let service: AuthLoginService;

		// Test data
		const testAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0";
		const mockSigningMessage = "Limitless Exchange wants you to sign in";
		const mockSignature =
			"0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12";

		it(
			"should reject invalid signature",
			async () => {
				service = new AuthLoginService();

				const params = {
					account: testAddress,
					signingMessage: mockSigningMessage,
					signature: mockSignature, // Invalid signature
					userData: {
						name: "Test User",
					},
				};

				// API should reject invalid signatures
				await expect(service.execute(params)).rejects.toThrow();

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should reject malformed account address",
			async () => {
				service = new AuthLoginService();

				const params = {
					account: "invalid-address",
					signingMessage: mockSigningMessage,
					signature: mockSignature,
					userData: {},
				};

				await expect(service.execute(params)).rejects.toThrow();

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should reject empty signature",
			async () => {
				service = new AuthLoginService();

				const params = {
					account: testAddress,
					signingMessage: mockSigningMessage,
					signature: "",
					userData: {},
				};

				await expect(service.execute(params)).rejects.toThrow();

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should handle authentication failure gracefully",
			async () => {
				service = new AuthLoginService();

				const params = {
					account: testAddress,
					signingMessage: mockSigningMessage,
					signature: mockSignature,
					userData: {},
				};

				try {
					await service.execute(params);
				} catch (error: any) {
					// Error should be informative
					expect(error.message).toBeTruthy();
					expect(
						error.message.includes("Authentication failed") ||
							error.message.includes("Failed to login"),
					).toBe(true);
				}

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should format successful login response correctly",
			async () => {
				service = new AuthLoginService();

				// Test the format method with mock data
				const mockResponse = {
					account: testAddress,
					token: "mock-token",
				};

				const formatted = service.format(mockResponse);

				expect(typeof formatted).toBe("string");
				expect(formatted).toContain("Login Successful");
				expect(formatted).toContain(testAddress);
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should accept optional user data fields",
			async () => {
				service = new AuthLoginService();

				const params = {
					account: testAddress,
					signingMessage: mockSigningMessage,
					signature: mockSignature,
					userData: {
						client: "eoa",
					},
				};

				// Should fail due to invalid signature, but not due to userData format
				try {
					await service.execute(params);
				} catch (error: any) {
					// Should fail on auth, not on userData parsing
					expect(error.message).not.toContain("userData");
					expect(error.message).not.toContain("JSON");
				}

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		// Real authentication flow tests with wallet signatures
		it(
			"should successfully authenticate with valid wallet signature",
			async () => {
				const wallet = createTestWallet();
				service = new AuthLoginService();

				// Get signing message
				const signingMessageService = new AuthSigningMessageService();
				const { message } = await signingMessageService.execute(wallet.address);
				await rateLimitDelay();

				// Sign message
				const signature = await wallet.signMessage(message);

				// Login
				const result = await service.execute({
					account: wallet.address,
					signingMessage: message,
					signature: signature,
					userData: {
						client: "eoa",
					},
				});

				// Verify response
				expect(result).toHaveProperty("account");
				expect(result.account.toLowerCase()).toBe(wallet.address.toLowerCase());

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() * 2 },
		);

		it(
			"should authenticate and return formatted response",
			async () => {
				const wallet = createTestWallet();

				const session = await authenticateTestWallet(wallet);

				// Verify session
				expect(session.account.toLowerCase()).toBe(
					wallet.address.toLowerCase(),
				);
				expect(session.signature).toBeTruthy();
				expect(session.signingMessage).toBeTruthy();

				// Test formatting
				service = new AuthLoginService();
				const formatted = service.format({
					account: session.account,
					token: session.token,
				});

				expect(formatted).toContain("Login Successful");
				expect(formatted).toContain(session.account);

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() * 2 },
		);

		it(
			"should authenticate with minimal user data",
			async () => {
				const wallet = createTestWallet();

				const session = await authenticateTestWallet(wallet, {});

				// Should succeed even with empty userData
				expect(session.account.toLowerCase()).toBe(
					wallet.address.toLowerCase(),
				);
				expect(session.signature).toBeTruthy();

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() * 2 },
		);

		it(
			"should reject reused signature with different message",
			async () => {
				const wallet = createTestWallet();
				service = new AuthLoginService();

				// Get first signing message
				const signingMessageService = new AuthSigningMessageService();
				const { message: message1 } = await signingMessageService.execute(
					wallet.address,
				);
				await rateLimitDelay();

				const signature1 = await wallet.signMessage(message1);

				// Get second signing message (different nonce)
				const { message: message2 } = await signingMessageService.execute(
					wallet.address,
				);
				await rateLimitDelay();

				// Try to use signature from message1 with message2
				await expect(
					service.execute({
						account: wallet.address,
						signingMessage: message2, // Different message
						signature: signature1, // Old signature
						userData: {},
					}),
				).rejects.toThrow();

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() * 3 },
		);
	},
);
