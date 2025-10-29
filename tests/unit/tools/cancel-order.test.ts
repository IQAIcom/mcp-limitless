import { beforeEach, describe, expect, it, vi } from "vitest";
import { cancelOrderTool } from "../../../src/tools/cancel-order.js";

// Mock the service
const mockExecute = vi.fn();
const mockFormat = vi.fn();

vi.mock("../../../src/services/cancel-order.js", () => ({
	CancelOrderService: vi.fn().mockImplementation(() => ({
		execute: mockExecute,
		format: mockFormat,
	})),
}));

import { CancelOrderService } from "../../../src/services/cancel-order.js";

describe("cancelOrderTool", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const validParams = {
		orderId: "order-123",
	};

	const mockResponse = {
		message: "Order cancelled successfully",
	};

	describe("metadata", () => {
		it("should have correct tool name", () => {
			expect(cancelOrderTool.name).toBe("CANCEL_ORDER");
		});

		it("should have a description", () => {
			expect(cancelOrderTool.description).toBeTruthy();
			expect(cancelOrderTool.description).toContain("Cancel an open order");
		});

		it("should have parameters schema", () => {
			expect(cancelOrderTool.parameters).toBeDefined();
		});
	});

	describe("parameter validation", () => {
		it("should validate required parameters", () => {
			const result = cancelOrderTool.parameters.safeParse(validParams);
			expect(result.success).toBe(true);
		});

		it("should reject missing orderId", () => {
			const { orderId, ...params } = validParams;
			const result = cancelOrderTool.parameters.safeParse(params);
			expect(result.success).toBe(false);
		});

		it("should accept different orderId formats", () => {
			const result = cancelOrderTool.parameters.safeParse({
				orderId: "0x123abc456def",
			});
			expect(result.success).toBe(true);
		});

		it("should reject invalid parameter types", () => {
			const result = cancelOrderTool.parameters.safeParse({
				orderId: 123,
			});
			expect(result.success).toBe(false);
		});

		it("should accept orderId as string", () => {
			const result = cancelOrderTool.parameters.safeParse({
				orderId: "valid-order-id",
			});
			expect(result.success).toBe(true);
		});
	});

	describe("execute", () => {
		it("should execute and return formatted cancel response", async () => {
			mockExecute.mockResolvedValueOnce(mockResponse);
			mockFormat.mockReturnValueOnce("✅ Order cancelled successfully");

			const result = await cancelOrderTool.execute(validParams);

			expect(mockExecute).toHaveBeenCalledWith(validParams.orderId);
			expect(mockFormat).toHaveBeenCalledWith(mockResponse);
			expect(result).toContain("✅ Order cancelled successfully");
		});

		it("should handle authentication errors", async () => {
			mockExecute.mockRejectedValueOnce(
				new Error(
					"Unauthorized. You must be authenticated and own this order.",
				),
			);

			const result = await cancelOrderTool.execute(validParams);

			expect(result).toContain("Error canceling order");
			expect(result).toContain("Unauthorized");
		});

		it("should handle order cannot be cancelled errors", async () => {
			mockExecute.mockRejectedValueOnce(
				new Error("Order cannot be cancelled: Order already filled"),
			);

			const result = await cancelOrderTool.execute(validParams);

			expect(result).toContain("Error canceling order");
			expect(result).toContain("Order cannot be cancelled");
		});

		it("should handle network errors", async () => {
			mockExecute.mockRejectedValueOnce(new Error("Network connection failed"));

			const result = await cancelOrderTool.execute(validParams);

			expect(result).toContain("Error canceling order");
			expect(result).toContain("Network connection failed");
		});

		it("should handle unknown errors", async () => {
			mockExecute.mockRejectedValueOnce("Unknown error");

			const result = await cancelOrderTool.execute(validParams);

			expect(result).toContain("unknown error");
		});

		it("should log errors to console", async () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
			mockExecute.mockRejectedValueOnce(new Error("Test error"));

			await cancelOrderTool.execute(validParams);

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("Error in CANCEL_ORDER tool"),
			);

			consoleSpy.mockRestore();
		});

		it("should handle order not found errors", async () => {
			mockExecute.mockRejectedValueOnce(new Error("Order not found"));

			const result = await cancelOrderTool.execute(validParams);

			expect(result).toContain("Error canceling order");
			expect(result).toContain("Order not found");
		});
	});

	describe("integration scenarios", () => {
		it("should handle complete successful cancellation flow", async () => {
			mockExecute.mockResolvedValueOnce(mockResponse);
			mockFormat.mockImplementation((response) => {
				return `✅ ${response.message}`;
			});

			const result = await cancelOrderTool.execute(validParams);

			expect(result).toContain("✅");
			expect(result).toContain("Order cancelled successfully");
		});

		it("should work with minimal parameters", async () => {
			mockExecute.mockResolvedValueOnce(mockResponse);
			mockFormat.mockReturnValueOnce("✅ Order cancelled");

			const result = await cancelOrderTool.execute({
				orderId: "order-999",
			});

			expect(result).toBe("✅ Order cancelled");
			expect(mockExecute).toHaveBeenCalledWith("order-999");
		});
	});
});
