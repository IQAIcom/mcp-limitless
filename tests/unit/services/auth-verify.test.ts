import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthVerifyService } from "../../../src/services/auth-verify.js";

// Mock the client module
vi.mock("../../../src/lib/client.js", () => ({
	client: {
		request: vi.fn(),
	},
}));

// Import after mocking
import { client } from "../../../src/lib/client.js";

describe("AuthVerifyService", () => {
	let service: AuthVerifyService;
	const mockClient = client as any;

	beforeEach(() => {
		service = new AuthVerifyService();
		vi.clearAllMocks();
	});

	describe("execute", () => {
		it("should successfully verify authentication", async () => {
			const mockAddress = "0x1234567890123456789012345678901234567890";
			mockClient.request.mockResolvedValueOnce(mockAddress);

			const result = await service.execute();

			expect(mockClient.request).toHaveBeenCalledWith("/auth/verify-auth");
			expect(result).toBe(mockAddress);
		});

		it("should throw error when response is empty", async () => {
			mockClient.request.mockResolvedValueOnce("");

			await expect(service.execute()).rejects.toThrow(
				"Unable to verify authentication",
			);
		});

		it("should throw error when not authenticated (401)", async () => {
			mockClient.request.mockRejectedValueOnce(new Error("401 Unauthorized"));

			await expect(service.execute()).rejects.toThrow(
				"Not authenticated. Please login first.",
			);
		});

		it("should handle API errors gracefully", async () => {
			mockClient.request.mockRejectedValueOnce(new Error("Network error"));

			await expect(service.execute()).rejects.toThrow(
				"Failed to verify authentication: Network error",
			);
		});
	});

	describe("format", () => {
		it("should format authentication address correctly", () => {
			const address = "0x1234567890123456789012345678901234567890";
			const formatted = service.format(address);

			expect(formatted).toContain("✅ Authenticated as:");
			expect(formatted).toContain(address);
		});
	});
});
