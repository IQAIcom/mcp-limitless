import { beforeEach, describe, expect, it, vi } from "vitest";
import { createOrderTool } from "../../../src/tools/create-order.js";

// Mock the service
const mockExecute = vi.fn();
const mockFormat = vi.fn();

vi.mock("../../../src/services/create-order.js", () => ({
	CreateOrderService: vi.fn().mockImplementation(() => ({
		execute: mockExecute,
		format: mockFormat,
	})),
}));

import { CreateOrderService } from "../../../src/services/create-order.js";

describe("createOrderTool", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const validParams = {
		order: {
			salt: 123456,
			maker: "0x1234567890123456789012345678901234567890",
			signer: "0x1234567890123456789012345678901234567890",
			taker: "0x0000000000000000000000000000000000000000",
			tokenId: "1",
			makerAmount: 1000000,
			takerAmount: 500000,
			expiration: "1735689600",
			nonce: 1,
			price: 0.5,
			feeRateBps: 100,
			side: "BUY" as const,
			signatureType: 0,
			signature: "0xabcdef...",
		},
		ownerId: 1,
		orderType: "GTC" as const,
		marketSlug: "bitcoin-100k-2024",
		apiKey: "test-api-key",
	};

	const mockResponse = {
		order: validParams.order,
		makerMatches: [],
	};

	describe("metadata", () => {
		it("should have correct tool name", () => {
			expect(createOrderTool.name).toBe("CREATE_ORDER");
		});

		it("should have a description", () => {
			expect(createOrderTool.description).toBeTruthy();
			expect(createOrderTool.description).toContain("Create a buy or sell order");
		});

		it("should have parameters schema", () => {
			expect(createOrderTool.parameters).toBeDefined();
		});
	});

	describe("parameter validation", () => {
		it("should validate required parameters", () => {
			const result = createOrderTool.parameters.safeParse(validParams);
			expect(result.success).toBe(true);
		});

		it("should reject missing order", () => {
			const { order, ...params } = validParams;
			const result = createOrderTool.parameters.safeParse(params);
			expect(result.success).toBe(false);
		});

		it("should reject invalid Ethereum address in maker", () => {
			const result = createOrderTool.parameters.safeParse({
				...validParams,
				order: { ...validParams.order, maker: "invalid-address" },
			});
			expect(result.success).toBe(false);
		});

		it("should accept valid Ethereum address formats", () => {
			const result = createOrderTool.parameters.safeParse({
				...validParams,
				order: {
					...validParams.order,
					maker: "0xABCDEF1234567890123456789012345678901234",
				},
			});
			expect(result.success).toBe(true);
		});

		it("should reject invalid signer address", () => {
			const result = createOrderTool.parameters.safeParse({
				...validParams,
				order: { ...validParams.order, signer: "0xinvalid" },
			});
			expect(result.success).toBe(false);
		});

		it("should reject missing ownerId", () => {
			const { ownerId, ...params } = validParams;
			const result = createOrderTool.parameters.safeParse(params);
			expect(result.success).toBe(false);
		});

		it("should reject missing orderType", () => {
			const { orderType, ...params } = validParams;
			const result = createOrderTool.parameters.safeParse(params);
			expect(result.success).toBe(false);
		});

		it("should reject invalid orderType", () => {
			const result = createOrderTool.parameters.safeParse({
				...validParams,
				orderType: "INVALID",
			});
			expect(result.success).toBe(false);
		});

		it("should accept FOK orderType", () => {
			const result = createOrderTool.parameters.safeParse({
				...validParams,
				orderType: "FOK",
			});
			expect(result.success).toBe(true);
		});

		it("should accept GTC orderType", () => {
			const result = createOrderTool.parameters.safeParse({
				...validParams,
				orderType: "GTC",
			});
			expect(result.success).toBe(true);
		});

		it("should reject missing marketSlug", () => {
			const { marketSlug, ...params } = validParams;
			const result = createOrderTool.parameters.safeParse(params);
			expect(result.success).toBe(false);
		});

		it("should accept optional apiKey", () => {
			const { apiKey, ...params } = validParams;
			const result = createOrderTool.parameters.safeParse(params);
			expect(result.success).toBe(true);
		});

		it("should reject negative makerAmount", () => {
			const result = createOrderTool.parameters.safeParse({
				...validParams,
				order: { ...validParams.order, makerAmount: -1 },
			});
			expect(result.success).toBe(false);
		});

		it("should reject negative takerAmount", () => {
			const result = createOrderTool.parameters.safeParse({
				...validParams,
				order: { ...validParams.order, takerAmount: -1 },
			});
			expect(result.success).toBe(false);
		});

		it("should reject price below 0.01", () => {
			const result = createOrderTool.parameters.safeParse({
				...validParams,
				order: { ...validParams.order, price: 0.005 },
			});
			expect(result.success).toBe(false);
		});

		it("should reject price above 0.99", () => {
			const result = createOrderTool.parameters.safeParse({
				...validParams,
				order: { ...validParams.order, price: 1.0 },
			});
			expect(result.success).toBe(false);
		});

		it("should accept valid price range", () => {
			const result = createOrderTool.parameters.safeParse({
				...validParams,
				order: { ...validParams.order, price: 0.75 },
			});
			expect(result.success).toBe(true);
		});

		it("should reject invalid side", () => {
			const result = createOrderTool.parameters.safeParse({
				...validParams,
				order: { ...validParams.order, side: "INVALID" },
			});
			expect(result.success).toBe(false);
		});

		it("should accept BUY side", () => {
			const result = createOrderTool.parameters.safeParse({
				...validParams,
				order: { ...validParams.order, side: "BUY" },
			});
			expect(result.success).toBe(true);
		});

		it("should accept SELL side", () => {
			const result = createOrderTool.parameters.safeParse({
				...validParams,
				order: { ...validParams.order, side: "SELL" },
			});
			expect(result.success).toBe(true);
		});

		it("should reject missing salt", () => {
			const { salt, ...order } = validParams.order;
			const result = createOrderTool.parameters.safeParse({
				...validParams,
				order,
			});
			expect(result.success).toBe(false);
		});

		it("should reject missing signature", () => {
			const { signature, ...order } = validParams.order;
			const result = createOrderTool.parameters.safeParse({
				...validParams,
				order,
			});
			expect(result.success).toBe(false);
		});
	});

	describe("execute", () => {
		it("should execute and return formatted order response", async () => {
			mockExecute.mockResolvedValueOnce(mockResponse);
			mockFormat.mockReturnValueOnce("✅ Order Created Successfully");

			const result = await createOrderTool.execute(validParams);

			const { apiKey, ...orderParams } = validParams;
			expect(mockExecute).toHaveBeenCalledWith(orderParams, apiKey);
			expect(mockFormat).toHaveBeenCalledWith(mockResponse);
			expect(result).toContain("✅ Order Created Successfully");
		});

		it("should execute without apiKey", async () => {
			const { apiKey, ...params } = validParams;
			mockExecute.mockResolvedValueOnce(mockResponse);
			mockFormat.mockReturnValueOnce("✅ Order Created Successfully");

			const result = await createOrderTool.execute(params);

			expect(mockExecute).toHaveBeenCalledWith(params, undefined);
			expect(result).toContain("✅ Order Created Successfully");
		});

		it("should handle authentication errors", async () => {
			mockExecute.mockRejectedValueOnce(
				new Error(
					"Unauthorized. This tool requires authentication with a valid API key or session token.",
				),
			);

			const result = await createOrderTool.execute(validParams);

			expect(result).toContain("Error creating order");
			expect(result).toContain("Unauthorized");
		});

		it("should handle invalid order data errors", async () => {
			mockExecute.mockRejectedValueOnce(
				new Error("Invalid order data: Insufficient balance"),
			);

			const result = await createOrderTool.execute(validParams);

			expect(result).toContain("Error creating order");
			expect(result).toContain("Invalid order data");
		});

		it("should handle network errors", async () => {
			mockExecute.mockRejectedValueOnce(new Error("Network connection failed"));

			const result = await createOrderTool.execute(validParams);

			expect(result).toContain("Error creating order");
			expect(result).toContain("Network connection failed");
		});

		it("should handle unknown errors", async () => {
			mockExecute.mockRejectedValueOnce("Unknown error");

			const result = await createOrderTool.execute(validParams);

			expect(result).toContain("unknown error");
		});

		it("should log errors to console", async () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
			mockExecute.mockRejectedValueOnce(new Error("Test error"));

			await createOrderTool.execute(validParams);

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("Error in CREATE_ORDER tool"),
			);

			consoleSpy.mockRestore();
		});

		it("should handle matched orders", async () => {
			const matchedResponse = {
				...mockResponse,
				makerMatches: [{ id: "match1" }],
			};
			mockExecute.mockResolvedValueOnce(matchedResponse);
			mockFormat.mockReturnValueOnce("✅ Order matched immediately");

			const result = await createOrderTool.execute(validParams);

			expect(mockFormat).toHaveBeenCalledWith(matchedResponse);
			expect(result).toContain("✅ Order matched immediately");
		});
	});

	describe("integration scenarios", () => {
		it("should handle complete successful order creation flow", async () => {
			mockExecute.mockResolvedValueOnce(mockResponse);
			mockFormat.mockImplementation((response) => {
				return `Order created: ${response.order.side} at ${response.order.price}`;
			});

			const result = await createOrderTool.execute(validParams);

			expect(result).toContain("Order created");
			expect(result).toContain("BUY");
			expect(result).toContain("0.5");
		});
	});
});
