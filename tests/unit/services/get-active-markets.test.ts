import { beforeEach, describe, expect, it, vi } from "vitest";
import { GetActiveMarketsService } from "../../../src/services/get-active-markets.js";

// Mock the client module
vi.mock("../../../src/lib/client.js", () => ({
	client: {
		request: vi.fn(),
	},
}));

// Import after mocking
import { client } from "../../../src/lib/client.js";

describe("GetActiveMarketsService", () => {
	let service: GetActiveMarketsService;
	const mockClient = client as any;

	beforeEach(() => {
		service = new GetActiveMarketsService();
		vi.clearAllMocks();
	});

	describe("execute", () => {
		it("should successfully get active markets with default parameters", async () => {
			// Mock API response format
			const mockAPIResponse = {
				data: [
					{
						question: "Will Bitcoin reach $100k?",
						slug: "bitcoin-100k",
						category: "Crypto",
						volume: "50000",
						liquidity: "25000",
					},
				],
				totalMarketsCount: 1,
			};

			// Expected service output format
			const expectedOutput = {
				markets: mockAPIResponse.data,
				total: 1,
				page: 1,
				limit: 10,
			};

			mockClient.request.mockResolvedValueOnce(mockAPIResponse);

			const result = await service.execute();

			expect(mockClient.request).toHaveBeenCalledWith(
				expect.stringContaining("/markets/active"),
			);
			expect(mockClient.request).toHaveBeenCalledWith(
				expect.stringContaining("page=1"),
			);
			expect(mockClient.request).toHaveBeenCalledWith(
				expect.stringContaining("limit=10"),
			);
			expect(mockClient.request).toHaveBeenCalledWith(
				expect.stringContaining("sortBy=newest"),
			);
			expect(result).toEqual(expectedOutput);
		});

		it("should get active markets with custom parameters", async () => {
			const mockAPIResponse = {
				data: [],
				totalMarketsCount: 0,
			};
			const expectedOutput = {
				markets: [],
				total: 0,
				page: 2,
				limit: 5,
			};
			mockClient.request.mockResolvedValueOnce(mockAPIResponse);

			const result = await service.execute(undefined, 2, 5, "volume");

			const callArg = mockClient.request.mock.calls[0][0];
			expect(callArg).toContain("page=2");
			expect(callArg).toContain("limit=5");
			expect(callArg).toContain("sortBy=volume");
			expect(result).toEqual(expectedOutput);
		});

		it("should get active markets by category", async () => {
			const mockAPIResponse = {
				data: [
					{
						question: "Test market",
						slug: "test-market",
					},
				],
				totalMarketsCount: 1,
			};
			const expectedOutput = {
				markets: mockAPIResponse.data,
				total: 1,
				page: 1,
				limit: 10,
			};
			mockClient.request.mockResolvedValueOnce(mockAPIResponse);

			const result = await service.execute(5, 1, 10, "newest");

			expect(mockClient.request).toHaveBeenCalledWith(
				expect.stringContaining("/markets/active/5"),
			);
			expect(result).toEqual(expectedOutput);
		});

		it("should handle API errors gracefully", async () => {
			mockClient.request.mockRejectedValueOnce(new Error("Network error"));

			await expect(service.execute()).rejects.toThrow(
				"Failed to get active markets: Network error",
			);
		});

		it("should handle 500 server errors", async () => {
			mockClient.request.mockRejectedValueOnce(
				new Error("API request failed: 500 Internal Server Error"),
			);

			await expect(service.execute()).rejects.toThrow(
				"Failed to get active markets",
			);
		});
	});

	describe("format", () => {
		it("should format active markets with all details", () => {
			const response = {
				markets: [
					{
						question: "Will Bitcoin reach $100k?",
						slug: "bitcoin-100k",
						category: "Crypto",
						volume: "50000",
						liquidity: "25000",
						endDate: "2024-12-31T23:59:59Z",
					},
				],
				total: 1,
				page: 1,
				limit: 10,
			};

			const formatted = service.format(response);

			expect(formatted).toContain("Active Markets");
			expect(formatted).toContain("1 total");
			expect(formatted).toContain("showing page 1");
			expect(formatted).toContain("Will Bitcoin reach $100k?");
			expect(formatted).toContain("bitcoin-100k");
			expect(formatted).toContain("Category: Crypto");
			expect(formatted).toContain("Volume: $50000");
			expect(formatted).toContain("Liquidity: $25000");
			expect(formatted).toContain("End Date:");
			expect(formatted).toContain("limitless.exchange/markets/bitcoin-100k");
		});

		it("should format empty results appropriately", () => {
			const response = {
				markets: [],
				total: 0,
				page: 1,
				limit: 10,
			};

			const formatted = service.format(response);

			expect(formatted).toContain("No active markets found");
		});

		it("should handle markets with missing optional fields", () => {
			const response = {
				markets: [
					{
						question: "Test market?",
						slug: "test-market",
					},
				],
				total: 1,
				page: 1,
				limit: 10,
			};

			const formatted = service.format(response);

			expect(formatted).toContain("Test market?");
			expect(formatted).toContain("test-market");
			expect(formatted).not.toContain("Category:");
			expect(formatted).not.toContain("Volume:");
		});

		it("should handle paginated results", () => {
			const response = {
				markets: [
					{
						question: "Market 1",
						slug: "market-1",
					},
					{
						question: "Market 2",
						slug: "market-2",
					},
				],
				total: 25,
				page: 2,
				limit: 10,
			};

			const formatted = service.format(response);

			expect(formatted).toContain("25 total");
			expect(formatted).toContain("showing page 2");
			expect(formatted).toContain("Market 1");
			expect(formatted).toContain("Market 2");
		});
	});
});
