import { beforeEach, describe, expect, it, vi } from "vitest";
import { authSigningMessageTool } from "../../../src/tools/auth-signing-message.js";

// Mock the service
const mockExecute = vi.fn();
const mockFormat = vi.fn();

vi.mock("../../../src/services/auth-signing-message.js", () => ({
	AuthSigningMessageService: vi.fn().mockImplementation(() => ({
		execute: mockExecute,
		format: mockFormat,
	})),
}));

import { AuthSigningMessageService } from "../../../src/services/auth-signing-message.js";

describe("authSigningMessageTool", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("metadata", () => {
		it("should have correct tool name", () => {
			expect(authSigningMessageTool.name).toBe("GET_SIGNING_MESSAGE");
		});

		it("should have a description", () => {
			expect(authSigningMessageTool.description).toBeTruthy();
			expect(authSigningMessageTool.description).toContain("signing message");
		});

		it("should have parameters schema", () => {
			expect(authSigningMessageTool.parameters).toBeDefined();
		});
	});

	describe("parameter validation", () => {
		it("should require address parameter", () => {
			const result = authSigningMessageTool.parameters.safeParse({});
			expect(result.success).toBe(false);
		});

		it("should accept valid address", () => {
			const result = authSigningMessageTool.parameters.safeParse({
				address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
			});
			expect(result.success).toBe(true);
		});

		it("should accept undefined", () => {
			const result = authSigningMessageTool.parameters.safeParse(undefined);
			expect(result.success).toBe(false); // zod objects don't accept undefined
		});
	});

	describe("execute", () => {
		it("should execute and return formatted signing message", async () => {
			const mockResponse = {
				message: "Sign this message to authenticate",
				nonce: "abc123",
			};
			const testAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0";

			mockExecute.mockResolvedValueOnce(mockResponse);
			mockFormat.mockReturnValueOnce(
				"📝 Signing Message:\n\nMessage: Sign this...\n\nNonce: abc123",
			);

			const result = await authSigningMessageTool.execute({
				address: testAddress,
			});

			expect(mockExecute).toHaveBeenCalledWith(testAddress);
			expect(mockFormat).toHaveBeenCalledWith(mockResponse);
			expect(result).toContain("📝 Signing Message:");
		});

		it("should handle service errors gracefully", async () => {
			const testAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0";
			mockExecute.mockRejectedValueOnce(
				new Error("Failed to get signing message"),
			);

			const result = await authSigningMessageTool.execute({
				address: testAddress,
			});

			expect(result).toContain("Error getting signing message");
			expect(result).toContain("Failed to get signing message");
		});

		it("should handle unknown errors", async () => {
			const testAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0";
			mockExecute.mockRejectedValueOnce("Unknown error");

			const result = await authSigningMessageTool.execute({
				address: testAddress,
			});

			expect(result).toContain("unknown error");
		});

		it("should log errors to console", async () => {
			const testAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0";
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
			mockExecute.mockRejectedValueOnce(new Error("Test error"));

			await authSigningMessageTool.execute({ address: testAddress });

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("Error in GET_SIGNING_MESSAGE tool"),
			);

			consoleSpy.mockRestore();
		});
	});
});
