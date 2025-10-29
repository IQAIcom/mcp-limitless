import { beforeEach, describe, expect, it, vi } from "vitest";
import { SearchMarketsService } from "../../../src/services/search-markets.js";
import {
	searchMarketsEmptyResponse,
	searchMarketsPaginatedResponse,
	searchMarketsSuccessResponse,
} from "../../helpers/fixtures/index.js";
import { assertContainsAll, assertNoResults } from "../../helpers/index.js";

// Mock the client module
vi.mock("../../../src/lib/client.js", () => ({
	client: {
		request: vi.fn(),
	},
}));

// Import after mocking
import { client } from "../../../src/lib/client.js";

describe("SearchMarketsService", () => {
	let service: SearchMarketsService;
	const mockClient = client as any;

	beforeEach(() => {
		service = new SearchMarketsService();
		vi.clearAllMocks();
	});

	describe("execute", () => {
		it("should successfully search markets with default parameters", async () => {
			mockClient.request.mockResolvedValueOnce(searchMarketsSuccessResponse);

			const result = await service.execute("bitcoin");

			expect(mockClient.request).toHaveBeenCalledWith(
				expect.stringContaining("/markets/search"),
			);
			expect(mockClient.request).toHaveBeenCalledWith(
				expect.stringContaining("query=bitcoin"),
			);
			expect(result).toEqual(searchMarketsSuccessResponse);
			expect(result.markets).toHaveLength(2);
			expect(result.total).toBe(2);
		});

		it("should search markets with custom parameters", async () => {
			mockClient.request.mockResolvedValueOnce(searchMarketsPaginatedResponse);

			const result = await service.execute("AI", 1, 2, 0.7);

			const callArg = mockClient.request.mock.calls[0][0];
			expect(callArg).toContain("query=AI");
			expect(callArg).toContain("limit=1");
			expect(callArg).toContain("page=2");
			expect(callArg).toContain("similarityThreshold=0.7");
			expect(result).toEqual(searchMarketsPaginatedResponse);
		});

		it("should return empty results when no markets found", async () => {
			mockClient.request.mockResolvedValueOnce(searchMarketsEmptyResponse);

			const result = await service.execute("nonexistent query");

			expect(result.markets).toHaveLength(0);
			expect(result.total).toBe(0);
		});

		it("should handle API errors gracefully", async () => {
			mockClient.request.mockRejectedValueOnce(new Error("Network error"));

			await expect(service.execute("bitcoin")).rejects.toThrow(
				"Failed to search markets: Network error",
			);
		});

		it("should handle 500 server errors", async () => {
			mockClient.request.mockRejectedValueOnce(
				new Error("API request failed: 500 Internal Server Error"),
			);

			await expect(service.execute("bitcoin")).rejects.toThrow(
				"Failed to search markets",
			);
		});
	});

	describe("format", () => {
		it("should format search results with all market details", () => {
			const formatted = service.format(searchMarketsSuccessResponse);

			// Check for main elements
			assertContainsAll(formatted, [
				"Found 2 markets",
				"showing page 1",
				"Will Bitcoin reach $100,000",
				"bitcoin-100k-2024",
				"Will Ethereum complete the merge",
				"ethereum-merge-success",
			]);

			// Check for market details
			assertContainsAll(formatted, [
				"Category: Crypto",
				"Volume: $125000",
				"Liquidity: $50000",
				"limitless.exchange/markets/bitcoin-100k-2024",
				"limitless.exchange/markets/ethereum-merge-success",
			]);
		});

		it("should format empty results appropriately", () => {
			const formatted = service.format(searchMarketsEmptyResponse);

			assertNoResults(formatted);
			expect(formatted).toContain("No markets found");
		});

		it("should handle paginated results", () => {
			const formatted = service.format(searchMarketsPaginatedResponse);

			assertContainsAll(formatted, [
				"Found 25 markets",
				"showing page 2",
				"Will AI surpass human intelligence",
				"ai-agi-2030",
			]);
		});

		it("should handle markets with missing optional fields", () => {
			const responseWithMissingFields = {
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

			const formatted = service.format(responseWithMissingFields);

			expect(formatted).toContain("Test market?");
			expect(formatted).toContain("test-market");
			expect(formatted).not.toContain("Category:");
			expect(formatted).not.toContain("Volume:");
		});
	});
});
