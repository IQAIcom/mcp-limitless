import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthLogoutService } from "../../../src/services/auth-logout.js";

// Mock the client module
vi.mock("../../../src/lib/client.js", () => ({
	client: {
		request: vi.fn(),
		clearSession: vi.fn(),
	},
}));

// Import after mocking
import { client } from "../../../src/lib/client.js";

describe("AuthLogoutService", () => {
	let service: AuthLogoutService;
	const mockClient = client as any;

	beforeEach(() => {
		service = new AuthLogoutService();
		vi.clearAllMocks();
	});

	describe("execute", () => {
		it("should successfully logout", async () => {
			const mockResponse = { message: "Logged out successfully" };
			mockClient.request.mockResolvedValueOnce(mockResponse);

			const result = await service.execute();

			expect(mockClient.request).toHaveBeenCalledWith("/auth/logout", {
				method: "POST",
				body: {}, // Empty body required by API
			});
			expect(result).toEqual(mockResponse);
		});

		it("should throw error when response is empty", async () => {
			mockClient.request.mockResolvedValueOnce(null);

			await expect(service.execute()).rejects.toThrow("Unable to logout");
		});

		it("should throw error when not authenticated (401)", async () => {
			mockClient.request.mockRejectedValueOnce(new Error("401 Unauthorized"));

			await expect(service.execute()).rejects.toThrow("Not authenticated.");
		});

		it("should handle network errors", async () => {
			mockClient.request.mockRejectedValueOnce(new Error("Network error"));

			await expect(service.execute()).rejects.toThrow(
				"Failed to logout: Network error",
			);
		});
	});

	describe("format", () => {
		it("should format logout response correctly", () => {
			const response = { message: "Logged out successfully" };
			const formatted = service.format(response);

			expect(formatted).toContain("✅");
			expect(formatted).toContain("Logged out successfully");
		});

		it("should handle different message formats", () => {
			const response = { message: "Session cleared" };
			const formatted = service.format(response);

			expect(formatted).toContain("Session cleared");
		});
	});
});
