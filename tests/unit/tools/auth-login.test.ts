import { beforeEach, describe, expect, it, vi } from "vitest";
import { authLoginTool } from "../../../src/tools/auth-login.js";

// Mock the service
const mockExecute = vi.fn();
const mockFormat = vi.fn();

vi.mock("../../../src/services/auth-login.js", () => ({
	AuthLoginService: vi.fn().mockImplementation(() => ({
		execute: mockExecute,
		format: mockFormat,
	})),
}));

import { AuthLoginService } from "../../../src/services/auth-login.js";

describe("authLoginTool", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const validParams = {
		account: "0x1234567890123456789012345678901234567890",
		signingMessage: "Sign this message to authenticate",
		signature: "0xabcdef...",
		userData: { name: "Test User" },
	};

	describe("metadata", () => {
		it("should have correct tool name", () => {
			expect(authLoginTool.name).toBe("LOGIN");
		});

		it("should have a description", () => {
			expect(authLoginTool.description).toBeTruthy();
			expect(authLoginTool.description).toContain("Authenticate");
		});

		it("should have parameters schema", () => {
			expect(authLoginTool.parameters).toBeDefined();
		});
	});

	describe("parameter validation", () => {
		it("should validate required parameters", () => {
			const result = authLoginTool.parameters.safeParse(validParams);
			expect(result.success).toBe(true);
		});

		it("should reject missing account", () => {
			const { account, ...params } = validParams;
			const result = authLoginTool.parameters.safeParse(params);
			expect(result.success).toBe(false);
		});

		it("should reject invalid Ethereum address", () => {
			const result = authLoginTool.parameters.safeParse({
				...validParams,
				account: "invalid-address",
			});
			expect(result.success).toBe(false);
		});

		it("should accept valid Ethereum address formats", () => {
			const result = authLoginTool.parameters.safeParse({
				...validParams,
				account: "0xABCDEF1234567890123456789012345678901234",
			});
			expect(result.success).toBe(true);
		});

		it("should reject missing signingMessage", () => {
			const { signingMessage, ...params } = validParams;
			const result = authLoginTool.parameters.safeParse(params);
			expect(result.success).toBe(false);
		});

		it("should reject missing signature", () => {
			const { signature, ...params } = validParams;
			const result = authLoginTool.parameters.safeParse(params);
			expect(result.success).toBe(false);
		});

		it("should accept optional userData fields", () => {
			const result = authLoginTool.parameters.safeParse({
				...validParams,
				userData: { name: "Test", email: "test@example.com" },
			});
			expect(result.success).toBe(true);
		});
	});

	describe("execute", () => {
		it("should execute and return formatted login response", async () => {
			const mockResponse = {
				account: validParams.account,
				token: "jwt-token",
			};
			mockExecute.mockResolvedValueOnce(mockResponse);
			mockFormat.mockReturnValueOnce("✅ Login Successful!");

			const result = await authLoginTool.execute(validParams);

			expect(mockExecute).toHaveBeenCalledWith(validParams);
			expect(mockFormat).toHaveBeenCalledWith(mockResponse);
			expect(result).toContain("✅ Login Successful!");
		});

		it("should handle service errors gracefully", async () => {
			mockExecute.mockRejectedValueOnce(
				new Error("Authentication failed: Invalid signature"),
			);

			const result = await authLoginTool.execute(validParams);

			expect(result).toContain("Error logging in");
			expect(result).toContain("Authentication failed");
		});

		it("should handle unknown errors", async () => {
			mockExecute.mockRejectedValueOnce("Unknown error");

			const result = await authLoginTool.execute(validParams);

			expect(result).toContain("unknown error");
		});

		it("should log errors to console", async () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
			mockExecute.mockRejectedValueOnce(new Error("Test error"));

			await authLoginTool.execute(validParams);

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("Error in LOGIN tool"),
			);

			consoleSpy.mockRestore();
		});
	});
});
