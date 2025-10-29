import { describe, expect, it } from "vitest";
import { AuthSigningMessageService } from "../../src/services/auth-signing-message.js";
import {
	getIntegrationTestTimeout,
	rateLimitDelay,
	setupIntegrationTests,
	shouldRunIntegrationTests,
} from "./setup.js";

/**
 * Integration tests for AuthSigningMessageService
 * These tests run against the real Limitless API
 *
 * To skip: SKIP_INTEGRATION_TESTS=true pnpm test:integration
 */
describe.skipIf(!shouldRunIntegrationTests())(
	"AuthSigningMessageService Integration",
	() => {
		setupIntegrationTests();

		let service: AuthSigningMessageService;

		// Use a valid Ethereum address format for testing (40 hex chars after 0x)
		const testAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0";

		it(
			"should get signing message with nonce",
			async () => {
				service = new AuthSigningMessageService();

				const result = await service.execute(testAddress);

				// Validate response structure
				expect(result).toHaveProperty("message");
				expect(result).toHaveProperty("nonce");

				expect(typeof result.message).toBe("string");
				expect(typeof result.nonce).toBe("string");

				// Message should contain authentication-related text
				expect(result.message).toContain("Limitless Exchange");
				expect(result.message).toContain("Signature");

				// Nonce should be a non-empty string and start with 0x
				expect(result.nonce.length).toBeGreaterThan(0);
				expect(result.nonce).toMatch(/^0x[a-fA-F0-9]+$/);

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should return formatted signing message",
			async () => {
				service = new AuthSigningMessageService();

				const result = await service.execute(testAddress);
				const formatted = service.format(result);

				expect(typeof formatted).toBe("string");
				expect(formatted.length).toBeGreaterThan(0);

				expect(formatted).toContain("Signing Message");
				expect(formatted).toContain("Message:");
				expect(formatted).toContain("Nonce:");

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should generate unique nonces for different requests",
			async () => {
				service = new AuthSigningMessageService();

				const result1 = await service.execute(testAddress);
				await rateLimitDelay(500);

				const result2 = await service.execute(testAddress);

				// Nonces should be different
				expect(result1.nonce).not.toBe(result2.nonce);

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() * 2 },
		);

		it(
			"should handle invalid address format",
			async () => {
				service = new AuthSigningMessageService();

				await expect(service.execute("invalid-address")).rejects.toThrow();

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);

		it(
			"should return consistent message format",
			async () => {
				service = new AuthSigningMessageService();

				const result = await service.execute(testAddress);

				// Message should follow expected format
				expect(result.message).toMatch(/Signature/i);
				expect(result.message).toContain("Limitless Exchange");

				await rateLimitDelay();
			},
			{ timeout: getIntegrationTestTimeout() },
		);
	},
);
