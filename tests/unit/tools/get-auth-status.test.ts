import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAuthStatusTool } from "../../../src/tools/get-auth-status.js";

// Mock the client module
vi.mock("../../../src/lib/client.js", () => ({
	client: {
		verifySession: vi.fn(),
	},
}));

// Import after mocking
import { client } from "../../../src/lib/client.js";

describe("getAuthStatusTool", () => {
	const mockClient = client as any;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("execute", () => {
		it("should return not authenticated message when verifySession returns null", async () => {
			mockClient.verifySession.mockResolvedValueOnce(null);

			const result = await getAuthStatusTool.execute({});

			expect(mockClient.verifySession).toHaveBeenCalled();
			expect(result).toContain("🔒 Not Authenticated");
			expect(result).toContain("GET_SIGNING_MESSAGE");
			expect(result).toContain("LOGIN");
		});

		it("should return authenticated message with address when verifySession returns address", async () => {
			const mockAddress = "0x1234567890123456789012345678901234567890";
			mockClient.verifySession.mockResolvedValueOnce(mockAddress);

			const result = await getAuthStatusTool.execute({});

			expect(mockClient.verifySession).toHaveBeenCalled();
			expect(result).toContain("✅ Authenticated");
			expect(result).toContain("Session Status: Active");
			expect(result).toContain(`Ethereum Address: ${mockAddress}`);
			expect(result).toContain("View your portfolio positions");
			expect(result).toContain("Place and cancel orders");
		});

		it("should handle errors gracefully", async () => {
			mockClient.verifySession.mockRejectedValueOnce(
				new Error("Network error"),
			);

			const result = await getAuthStatusTool.execute({});

			expect(result).toContain("❌ Error checking authentication status");
			expect(result).toContain("Network error");
		});

		it("should handle unknown errors", async () => {
			mockClient.verifySession.mockRejectedValueOnce("unknown error");

			const result = await getAuthStatusTool.execute({});

			expect(result).toContain(
				"❌ An unknown error occurred while checking authentication status",
			);
		});
	});

	describe("tool definition", () => {
		it("should have correct name", () => {
			expect(getAuthStatusTool.name).toBe("GET_AUTH_STATUS");
		});

		it("should have description", () => {
			expect(getAuthStatusTool.description).toBeTruthy();
			expect(getAuthStatusTool.description).toContain("authentication status");
		});

		it("should have empty parameters schema", () => {
			expect(getAuthStatusTool.parameters).toBeDefined();
		});
	});
});
