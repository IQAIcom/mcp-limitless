import { beforeEach, describe, expect, it, vi } from "vitest";
import { authVerifyTool } from "../../../src/tools/auth-verify.js";

// Mock the service
const mockExecute = vi.fn();
const mockFormat = vi.fn();

vi.mock("../../../src/services/auth-verify.js", () => ({
	AuthVerifyService: vi.fn().mockImplementation(() => ({
		execute: mockExecute,
		format: mockFormat,
	})),
}));

import { AuthVerifyService } from "../../../src/services/auth-verify.js";

describe("authVerifyTool", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("metadata", () => {
		it("should have correct tool name", () => {
			expect(authVerifyTool.name).toBe("VERIFY_AUTH");
		});

		it("should have a description", () => {
			expect(authVerifyTool.description).toBeTruthy();
			expect(authVerifyTool.description).toContain("authenticated");
		});

		it("should have parameters schema", () => {
			expect(authVerifyTool.parameters).toBeDefined();
		});
	});

	describe("parameter validation", () => {
		it("should accept empty parameters", () => {
			const result = authVerifyTool.parameters.safeParse({});
			expect(result.success).toBe(true);
		});
	});

	describe("execute", () => {
		it("should execute and return formatted address", async () => {
			const mockAddress = "0x1234567890123456789012345678901234567890";
			mockExecute.mockResolvedValueOnce(mockAddress);
			mockFormat.mockReturnValueOnce(`✅ Authenticated as: ${mockAddress}`);

			const result = await authVerifyTool.execute({});

			expect(mockExecute).toHaveBeenCalledWith();
			expect(mockFormat).toHaveBeenCalledWith(mockAddress);
			expect(result).toContain("✅ Authenticated as:");
		});

		it("should handle service errors gracefully", async () => {
			mockExecute.mockRejectedValueOnce(
				new Error("Not authenticated. Please login first."),
			);

			const result = await authVerifyTool.execute({});

			expect(result).toContain("Error verifying authentication");
			expect(result).toContain("Not authenticated");
		});

		it("should handle unknown errors", async () => {
			mockExecute.mockRejectedValueOnce("Unknown error");

			const result = await authVerifyTool.execute({});

			expect(result).toContain("unknown error");
		});

		it("should log errors to console", async () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
			mockExecute.mockRejectedValueOnce(new Error("Test error"));

			await authVerifyTool.execute({});

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("Error in VERIFY_AUTH tool"),
			);

			consoleSpy.mockRestore();
		});
	});
});
