import { beforeEach, describe, expect, it, vi } from "vitest";
import { GetActiveMarketsByCategoryService } from "../../../src/services/get-active-markets-by-category.js";

// Mock the client module
vi.mock("../../../src/lib/client.js", () => ({
	client: {
		request: vi.fn(),
	},
}));

// Import after mocking
import { client } from "../../../src/lib/client.js";

describe("GetActiveMarketsByCategoryService", () => {
	let service: GetActiveMarketsByCategoryService;
	const mockClient = client as any;

	beforeEach(() => {
		service = new GetActiveMarketsByCategoryService();
		vi.clearAllMocks();
	});

	describe("execute", () => {
		it("should successfully get active markets by category", async () => {
			const mockResponse = {
				markets: [
					{
						id: "1",
						slug: "bitcoin-100k",
						title: "Will Bitcoin reach $100k?",
						volume: 50000,
						liquidity: 25000,
					},
				],
				total: 1,
				page: 1,
				limit: 10,
			};
			mockClient.request.mockResolvedValueOnce(mockResponse);

			const result = await service.execute({ categoryId: 5 });

			expect(mockClient.request).toHaveBeenCalledWith(
				expect.stringContaining("/markets/active/5"),
			);
			expect(result).toEqual(mockResponse);
		});

		it("should get active markets with pagination parameters", async () => {
			const mockResponse = {
				markets: [],
				total: 0,
				page: 2,
				limit: 5,
			};
			mockClient.request.mockResolvedValueOnce(mockResponse);

			const result = await service.execute({
				categoryId: 3,
				page: 2,
				limit: 5,
			});

			const callArg = mockClient.request.mock.calls[0][0];
			expect(callArg).toContain("/markets/active/3");
			expect(callArg).toContain("page=2");
			expect(callArg).toContain("limit=5");
			expect(result).toEqual(mockResponse);
		});

		it("should get active markets with sortBy parameter", async () => {
			const mockResponse = {
				markets: [],
				total: 0,
				page: 1,
				limit: 10,
			};
			mockClient.request.mockResolvedValueOnce(mockResponse);

			const result = await service.execute({
				categoryId: 2,
				sortBy: "volume",
			});

			const callArg = mockClient.request.mock.calls[0][0];
			expect(callArg).toContain("sortBy=volume");
			expect(result).toEqual(mockResponse);
		});

		it("should throw error when response is null", async () => {
			mockClient.request.mockResolvedValueOnce(null);

			await expect(service.execute({ categoryId: 1 })).rejects.toThrow(
				"Unable to retrieve active markets by category",
			);
		});

		it("should handle API errors gracefully", async () => {
			mockClient.request.mockRejectedValueOnce(new Error("Network error"));

			await expect(service.execute({ categoryId: 1 })).rejects.toThrow(
				"Failed to get active markets by category: Network error",
			);
		});

		it("should handle 500 server errors", async () => {
			mockClient.request.mockRejectedValueOnce(
				new Error("API request failed: 500 Internal Server Error"),
			);

			await expect(service.execute({ categoryId: 1 })).rejects.toThrow(
				"Failed to get active markets by category",
			);
		});
	});

	describe("format", () => {
		it("should format active markets with all details", () => {
			const response = {
				markets: [
					{
						id: "1",
						slug: "bitcoin-100k",
						title: "Will Bitcoin reach $100k?",
						volume: 50000,
						liquidity: 25000,
					},
				],
				total: 1,
				page: 1,
				limit: 10,
			};

			const formatted = service.format(response, 5);

			expect(formatted).toContain("Active Markets in Category 5");
			expect(formatted).toContain("Will Bitcoin reach $100k?");
			expect(formatted).toContain("bitcoin-100k");
			expect(formatted).toContain("Volume: $50000.00");
			expect(formatted).toContain("Liquidity: $25000.00");
			expect(formatted).toContain("Total Markets: 1");
			expect(formatted).toContain("Page: 1");
		});

		it("should format empty results appropriately", () => {
			const response = {
				markets: [],
				total: 0,
				page: 1,
				limit: 10,
			};

			const formatted = service.format(response, 5);

			expect(formatted).toContain("No active markets found in category 5");
		});

		it("should handle markets with missing optional fields", () => {
			const response = {
				markets: [
					{
						id: "1",
						slug: "test-market",
						title: "Test market?",
					},
				],
				total: 1,
				page: 1,
				limit: 10,
			};

			const formatted = service.format(response, 2);

			expect(formatted).toContain("Test market?");
			expect(formatted).toContain("test-market");
			expect(formatted).not.toContain("Volume:");
			expect(formatted).not.toContain("Liquidity:");
		});

		it("should limit display to 10 markets", () => {
			const markets = Array.from({ length: 15 }, (_, i) => ({
				id: `${i}`,
				slug: `market-${i}`,
				title: `Market ${i}`,
			}));

			const response = {
				markets,
				total: 15,
				page: 1,
				limit: 15,
			};

			const formatted = service.format(response, 1);

			expect(formatted).toContain("Market 0");
			expect(formatted).toContain("Market 9");
			expect(formatted).not.toContain("Market 10");
			expect(formatted).toContain("Total Markets: 15");
		});
	});
});
