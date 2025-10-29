import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateOrderService } from "../../../src/services/create-order.js";

// Mock the client module
vi.mock("../../../src/lib/client.js", () => ({
	client: {
		request: vi.fn(),
	},
}));

// Import after mocking
import { client } from "../../../src/lib/client.js";

describe("CreateOrderService", () => {
	let service: CreateOrderService;
	const mockClient = client as any;

	beforeEach(() => {
		service = new CreateOrderService();
		vi.clearAllMocks();
	});

	const validOrderParams = {
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
			side: "BUY",
			signatureType: 0,
			signature: "0xabcdef...",
		},
		ownerId: 1,
		orderType: "GTC" as const,
		marketSlug: "bitcoin-100k-2024",
	};

	const mockSuccessResponse = {
		order: {
			...validOrderParams.order,
		},
		makerMatches: [],
	};

	const mockMatchedResponse = {
		order: {
			...validOrderParams.order,
		},
		makerMatches: [
			{ id: "match1", amount: 500000 },
			{ id: "match2", amount: 500000 },
		],
	};

	describe("execute", () => {
		it("should successfully create order", async () => {
			mockClient.request.mockResolvedValueOnce(mockSuccessResponse);

			const result = await service.execute(validOrderParams);

			expect(mockClient.request).toHaveBeenCalledWith("/orders", {
				method: "POST",
				body: validOrderParams,
			});
			expect(result).toEqual(mockSuccessResponse);
		});

		it("should successfully create order with immediate matches", async () => {
			mockClient.request.mockResolvedValueOnce(mockMatchedResponse);

			const result = await service.execute(validOrderParams);

			expect(result).toEqual(mockMatchedResponse);
			expect(result.makerMatches).toHaveLength(2);
		});

		it("should throw error when response is empty", async () => {
			mockClient.request.mockResolvedValueOnce(null);

			await expect(service.execute(validOrderParams)).rejects.toThrow(
				"Unable to create order",
			);
		});

		it("should handle 401 authentication errors", async () => {
			mockClient.request.mockRejectedValueOnce(new Error("401 Unauthorized"));

			await expect(service.execute(validOrderParams)).rejects.toThrow(
				"Unauthorized. This tool requires authentication with a valid API key or session token.",
			);
		});

		it("should handle 400 bad request errors", async () => {
			mockClient.request.mockRejectedValue(
				new Error("400 Bad Request: Insufficient balance"),
			);

			const error = await service.execute(validOrderParams).catch((e) => e);
			expect(error.message).toContain("Invalid order data");
			expect(error.message).toContain(
				"Check balance, allowance, or market deadline",
			);
		});

		it("should handle network errors", async () => {
			mockClient.request.mockRejectedValueOnce(new Error("Network error"));

			await expect(service.execute(validOrderParams)).rejects.toThrow(
				"Failed to create order: Network error",
			);
		});

		it("should handle 500 server errors", async () => {
			mockClient.request.mockRejectedValueOnce(
				new Error("API request failed: 500 Internal Server Error"),
			);

			await expect(service.execute(validOrderParams)).rejects.toThrow(
				"Failed to create order",
			);
		});
	});

	describe("format", () => {
		it("should format successful order creation without matches", () => {
			const formatted = service.format(mockSuccessResponse);

			expect(formatted).toContain("✅ Order Created Successfully");
			expect(formatted).toContain("Side: BUY");
			expect(formatted).toContain("Price: 0.5000");
			expect(formatted).toContain("Maker Amount: 1000000");
			expect(formatted).toContain("Taker Amount: 500000");
			expect(formatted).toContain("Expiration: 1735689600");
			expect(formatted).not.toContain("matched immediately");
		});

		it("should format successful order creation with matches", () => {
			const formatted = service.format(mockMatchedResponse);

			expect(formatted).toContain("✅ Order Created Successfully");
			expect(formatted).toContain("Side: BUY");
			expect(formatted).toContain("🎯 Order was matched immediately");
			expect(formatted).toContain("Matches: 2");
		});

		it("should format SELL orders correctly", () => {
			const sellResponse = {
				order: {
					...mockSuccessResponse.order,
					side: "SELL",
				},
				makerMatches: [],
			};

			const formatted = service.format(sellResponse);

			expect(formatted).toContain("Side: SELL");
		});

		it("should handle orders with no matches array", () => {
			const responseWithoutMatches = {
				order: mockSuccessResponse.order,
			};

			const formatted = service.format(responseWithoutMatches);

			expect(formatted).toContain("✅ Order Created Successfully");
			expect(formatted).not.toContain("matched immediately");
		});

		it("should format price with correct decimal places", () => {
			const customPriceResponse = {
				order: {
					...mockSuccessResponse.order,
					price: 0.7234,
				},
			};

			const formatted = service.format(customPriceResponse);

			expect(formatted).toContain("Price: 0.7234");
		});
	});
});
