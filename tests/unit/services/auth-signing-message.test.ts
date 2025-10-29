import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthSigningMessageService } from "../../../src/services/auth-signing-message.js";

// Mock fetch
global.fetch = vi.fn();

describe("AuthSigningMessageService", () => {
	let service: AuthSigningMessageService;
	const mockFetch = global.fetch as any;
	const testAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0";

	beforeEach(() => {
		service = new AuthSigningMessageService();
		vi.clearAllMocks();
	});

	describe("execute", () => {
		it("should successfully get signing message", async () => {
			const mockText =
				"Welcome to Limitless Exchange!\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nSignature is required to authenticate an upcoming API request.\n\nNonce: 0xabc123";
			mockFetch.mockResolvedValueOnce({
				ok: true,
				text: async () => mockText,
			});

			const result = await service.execute(testAddress);

			expect(mockFetch).toHaveBeenCalledWith(
				`https://api.limitless.exchange/auth/signing-message?address=${testAddress}`,
			);
			expect(result).toHaveProperty("message");
			expect(result).toHaveProperty("nonce");
			expect(result.nonce).toBe("0xabc123");
			expect(result.message).toContain("Welcome to Limitless Exchange");
		});

		it("should throw error for invalid address", async () => {
			await expect(service.execute("invalid-address")).rejects.toThrow(
				"Invalid Ethereum address format",
			);
		});

		it("should throw error when response is empty", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				text: async () => "",
			});

			await expect(service.execute(testAddress)).rejects.toThrow(
				"Unable to retrieve signing message",
			);
		});

		it("should throw error when response is null", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				text: async () => null,
			});

			await expect(service.execute(testAddress)).rejects.toThrow(
				"Unable to retrieve signing message",
			);
		});

		it("should handle API errors gracefully", async () => {
			mockFetch.mockRejectedValueOnce(new Error("Network error"));

			await expect(service.execute(testAddress)).rejects.toThrow(
				"Failed to get signing message: Network error",
			);
		});

		it("should handle 500 server errors", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 500,
				statusText: "Internal Server Error",
			});

			await expect(service.execute(testAddress)).rejects.toThrow(
				"Failed to get signing message",
			);
		});
	});

	describe("format", () => {
		it("should format signing message correctly", () => {
			const response = {
				message: "Sign this message to authenticate with Limitless.",
				nonce: "0xabc123",
			};
			const formatted = service.format(response);

			expect(formatted).toContain("📝 Signing Message:");
			expect(formatted).toContain("Message:");
			expect(formatted).toContain("Sign this message to authenticate");
			expect(formatted).toContain("Nonce:");
			expect(formatted).toContain("0xabc123");
		});

		it("should handle multiline messages", () => {
			const response = {
				message: "Welcome to Limitless!\n\nSign this message to authenticate.",
				nonce: "0xxyz789",
			};
			const formatted = service.format(response);

			expect(formatted).toContain("📝 Signing Message:");
			expect(formatted).toContain("Welcome to Limitless!");
			expect(formatted).toContain("Nonce: 0xxyz789");
		});
	});
});
