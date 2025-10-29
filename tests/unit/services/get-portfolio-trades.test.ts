import { beforeEach, describe, expect, it, vi } from "vitest";
import { GetPortfolioTradesService } from "../../../src/services/get-portfolio-trades.js";

// Mock the client module
vi.mock("../../../src/lib/client.js", () => ({
	client: {
		request: vi.fn(),
	},
}));

// Import after mocking
import { client } from "../../../src/lib/client.js";

describe("GetPortfolioTradesService", () => {
	let service: GetPortfolioTradesService;
	const mockClient = client as any;

	beforeEach(() => {
		service = new GetPortfolioTradesService();
		vi.clearAllMocks();
	});

	const mockTradesResponse = {
		trades: [
			{
				id: "trade-1",
				market: "Will Bitcoin reach $100k?",
				side: "BUY",
				price: 0.65,
				quantity: 100,
				timestamp: "2024-01-15T10:30:00Z",
			},
			{
				id: "trade-2",
				market: "Will Ethereum merge succeed?",
				side: "SELL",
				price: 0.3,
				quantity: 50,
				timestamp: "2024-01-14T15:45:00Z",
			},
		],
	};

	describe("execute", () => {
		it("should successfully get portfolio trades without API key", async () => {
			mockClient.request.mockResolvedValueOnce(mockTradesResponse);

			const result = await service.execute();

			expect(mockClient.request).toHaveBeenCalledWith("/portfolio/trades", {
				headers: {},
			});
			expect(result).toEqual(mockTradesResponse);
			expect(result.trades).toHaveLength(2);
		});

		it("should successfully get portfolio trades with API key", async () => {
			mockClient.request.mockResolvedValueOnce(mockTradesResponse);

			const result = await service.execute("test-api-key");

			expect(mockClient.request).toHaveBeenCalledWith("/portfolio/trades", {
				headers: {
					Authorization: "Bearer test-api-key",
				},
			});
			expect(result).toEqual(mockTradesResponse);
		});

		it("should throw error when response is empty", async () => {
			mockClient.request.mockResolvedValueOnce(null);

			await expect(service.execute()).rejects.toThrow(
				"Unable to retrieve trades",
			);
		});

		it("should handle 401 authentication errors", async () => {
			mockClient.request.mockRejectedValue(new Error("401 Unauthorized"));

			const error = await service.execute().catch((e) => e);
			expect(error.message).toContain("Unauthorized");
			expect(error.message).toContain("This tool requires authentication");
		});

		it("should handle network errors", async () => {
			mockClient.request.mockRejectedValueOnce(new Error("Network error"));

			await expect(service.execute()).rejects.toThrow(
				"Failed to get portfolio trades: Network error",
			);
		});

		it("should handle 500 server errors", async () => {
			mockClient.request.mockRejectedValueOnce(
				new Error("API request failed: 500 Internal Server Error"),
			);

			await expect(service.execute()).rejects.toThrow(
				"Failed to get portfolio trades",
			);
		});
	});

	describe("format", () => {
		it("should format trade history with all details", () => {
			const formatted = service.format(mockTradesResponse);

			expect(formatted).toContain("💼 Your Trading History");
			expect(formatted).toContain("Will Bitcoin reach $100k?");
			expect(formatted).toContain("Side: BUY");
			expect(formatted).toContain("Price: 0.6500");
			expect(formatted).toContain("Quantity: 100");
			expect(formatted).toContain("Total Trades: 2");
		});

		it("should format timestamps correctly", () => {
			const formatted = service.format(mockTradesResponse);

			expect(formatted).toContain("Time:");
		});

		it("should handle empty trades", () => {
			const emptyResponse = {
				trades: [],
			};

			const formatted = service.format(emptyResponse);

			expect(formatted).toContain("No trades found");
		});

		it("should limit display to 10 trades", () => {
			const manyTrades = {
				trades: Array.from({ length: 15 }, (_, i) => ({
					id: `trade-${i}`,
					market: `Market ${i}`,
					side: "BUY",
					price: 0.5,
					quantity: 10,
					timestamp: "2024-01-15T10:30:00Z",
				})),
			};

			const formatted = service.format(manyTrades);

			expect(formatted).toContain("...and 5 more trades");
			expect(formatted).toContain("Total Trades: 15");
		});

		it("should not show 'more trades' message when exactly 10 trades", () => {
			const exactlyTenTrades = {
				trades: Array.from({ length: 10 }, (_, i) => ({
					id: `trade-${i}`,
					market: `Market ${i}`,
					side: "BUY",
					price: 0.5,
					quantity: 10,
					timestamp: "2024-01-15T10:30:00Z",
				})),
			};

			const formatted = service.format(exactlyTenTrades);

			expect(formatted).not.toContain("more trades");
			expect(formatted).toContain("Total Trades: 10");
		});

		it("should handle SELL side trades", () => {
			const formatted = service.format(mockTradesResponse);

			expect(formatted).toContain("Will Ethereum merge succeed?");
			expect(formatted).toContain("Side: SELL");
		});
	});
});
