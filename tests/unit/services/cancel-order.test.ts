import { beforeEach, describe, expect, it, vi } from "vitest";
import { CancelOrderService } from "../../../src/services/cancel-order.js";

// Mock the client module
vi.mock("../../../src/lib/client.js", () => ({
	client: {
		request: vi.fn(),
	},
}));

// Import after mocking
import { client } from "../../../src/lib/client.js";

describe("CancelOrderService", () => {
	let service: CancelOrderService;
	const mockClient = client as any;

	beforeEach(() => {
		service = new CancelOrderService();
		vi.clearAllMocks();
	});

	const mockSuccessResponse = {
		message: "Order cancelled successfully",
	};

	describe("execute", () => {
		it("should successfully cancel order", async () => {
			mockClient.request.mockResolvedValueOnce(mockSuccessResponse);

			const result = await service.execute("order-123");

			expect(mockClient.request).toHaveBeenCalledWith("/orders/order-123", {
				method: "DELETE",
			});
			expect(result).toEqual(mockSuccessResponse);
		});

		it("should throw error when response is empty", async () => {
			mockClient.request.mockResolvedValueOnce(null);

			await expect(service.execute("order-123")).rejects.toThrow(
				"Unable to cancel order",
			);
		});

		it("should handle 401 authentication errors", async () => {
			mockClient.request.mockRejectedValueOnce(new Error("401 Unauthorized"));

			await expect(service.execute("order-123")).rejects.toThrow(
				"Unauthorized. You must be authenticated and own this order.",
			);
		});

		it("should handle 400 bad request errors", async () => {
			mockClient.request.mockRejectedValueOnce(
				new Error("400 Bad Request: Order already filled"),
			);

			await expect(service.execute("order-123")).rejects.toThrow(
				"Order cannot be cancelled",
			);
		});

		it("should handle network errors", async () => {
			mockClient.request.mockRejectedValueOnce(new Error("Network error"));

			await expect(service.execute("order-123")).rejects.toThrow(
				"Failed to cancel order: Network error",
			);
		});

		it("should handle 500 server errors", async () => {
			mockClient.request.mockRejectedValueOnce(
				new Error("API request failed: 500 Internal Server Error"),
			);

			await expect(service.execute("order-123")).rejects.toThrow(
				"Failed to cancel order",
			);
		});

		it("should handle different order ID formats", async () => {
			mockClient.request.mockResolvedValueOnce(mockSuccessResponse);

			await service.execute("0x123abc");

			expect(mockClient.request).toHaveBeenCalledWith("/orders/0x123abc", {
				method: "DELETE",
			});
		});
	});

	describe("format", () => {
		it("should format success message correctly", () => {
			const formatted = service.format(mockSuccessResponse);

			expect(formatted).toBe("✅ Order cancelled successfully");
		});

		it("should handle different success messages", () => {
			const response = {
				message: "Order has been cancelled",
			};
			const formatted = service.format(response);

			expect(formatted).toBe("✅ Order has been cancelled");
		});

		it("should include checkmark emoji in formatted output", () => {
			const formatted = service.format(mockSuccessResponse);

			expect(formatted).toContain("✅");
		});
	});
});
