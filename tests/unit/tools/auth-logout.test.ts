import { beforeEach, describe, expect, it, vi } from "vitest";
import { authLogoutTool } from "../../../src/tools/auth-logout.js";

// Mock the service
const mockExecute = vi.fn();
const mockFormat = vi.fn();

vi.mock("../../../src/services/auth-logout.js", () => ({
	AuthLogoutService: vi.fn().mockImplementation(() => ({
		execute: mockExecute,
		format: mockFormat,
	})),
}));

import { AuthLogoutService } from "../../../src/services/auth-logout.js";

describe("authLogoutTool", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("metadata", () => {
		it("should have correct tool name", () => {
			expect(authLogoutTool.name).toBe("LOGOUT");
		});

		it("should have a description", () => {
			expect(authLogoutTool.description).toBeTruthy();
			expect(authLogoutTool.description).toContain("Log out");
		});

		it("should have parameters schema", () => {
			expect(authLogoutTool.parameters).toBeDefined();
		});
	});

	describe("parameter validation", () => {
		it("should accept empty parameters", () => {
			const result = authLogoutTool.parameters.safeParse({});
			expect(result.success).toBe(true);
		});

		it("should accept apiKey parameter", () => {
			const result = authLogoutTool.parameters.safeParse({
				apiKey: "test-key",
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.apiKey).toBe("test-key");
			}
		});

		it("should reject invalid parameter types", () => {
			const result = authLogoutTool.parameters.safeParse({
				apiKey: 123,
			});
			expect(result.success).toBe(false);
		});
	});

	describe("execute", () => {
		it("should execute and return formatted response", async () => {
			const mockResponse = { message: "Logged out successfully" };
			mockExecute.mockResolvedValueOnce(mockResponse);
			mockFormat.mockReturnValueOnce("✅ Logged out successfully");

			const result = await authLogoutTool.execute({});

			expect(mockExecute).toHaveBeenCalledWith(undefined);
			expect(mockFormat).toHaveBeenCalledWith(mockResponse);
			expect(result).toContain("✅");
		});

		it("should pass apiKey to service", async () => {
			const mockResponse = { message: "Logged out successfully" };
			mockExecute.mockResolvedValueOnce(mockResponse);
			mockFormat.mockReturnValueOnce("✅ Logged out successfully");

			await authLogoutTool.execute({ apiKey: "test-key" });

			expect(mockExecute).toHaveBeenCalledWith("test-key");
		});

		it("should handle service errors gracefully", async () => {
			mockExecute.mockRejectedValueOnce(new Error("Not authenticated."));

			const result = await authLogoutTool.execute({});

			expect(result).toContain("Error logging out");
			expect(result).toContain("Not authenticated");
		});

		it("should handle unknown errors", async () => {
			mockExecute.mockRejectedValueOnce("Unknown error");

			const result = await authLogoutTool.execute({});

			expect(result).toContain("unknown error");
		});

		it("should log errors to console", async () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
			mockExecute.mockRejectedValueOnce(new Error("Test error"));

			await authLogoutTool.execute({});

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("Error in LOGOUT tool"),
			);

			consoleSpy.mockRestore();
		});
	});
});
