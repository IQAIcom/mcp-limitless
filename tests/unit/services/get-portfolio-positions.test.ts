import { beforeEach, describe, expect, it, vi } from "vitest";
import { GetPortfolioPositionsService } from "../../../src/services/get-portfolio-positions.js";

// Mock the client module
vi.mock("../../../src/lib/client.js", () => ({
	client: {
		request: vi.fn(),
	},
}));

// Import after mocking
import { client } from "../../../src/lib/client.js";

describe("GetPortfolioPositionsService", () => {
	let service: GetPortfolioPositionsService;
	const mockClient = client as any;

	beforeEach(() => {
		service = new GetPortfolioPositionsService();
		vi.clearAllMocks();
	});

	const mockPortfolioResponse = {
		positions: [
			{
				market: "Will Bitcoin reach $100k?",
				outcome: "Yes",
				quantity: 100,
				avgPrice: 0.65,
				currentPrice: 0.72,
				pnl: 7.0,
				pnlPercent: 10.77,
			},
			{
				market: "Will Ethereum merge succeed?",
				outcome: "No",
				quantity: 50,
				avgPrice: 0.3,
				currentPrice: 0.25,
				pnl: -2.5,
				pnlPercent: -16.67,
			},
		],
		totalValue: 1000.0,
		totalPnl: 4.5,
		totalPnlPercent: 0.45,
	};

	describe("execute", () => {
		it("should successfully get portfolio positions", async () => {
			mockClient.request.mockResolvedValueOnce(mockPortfolioResponse);

			const result = await service.execute();

			expect(mockClient.request).toHaveBeenCalledWith("/portfolio/positions");
			expect(result).toEqual(mockPortfolioResponse);
			expect(result.positions).toHaveLength(2);
		});

		it("should throw error when response is empty", async () => {
			mockClient.request.mockResolvedValueOnce(null);

			await expect(service.execute()).rejects.toThrow(
				"Unable to retrieve portfolio positions",
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
				"Failed to get portfolio positions: Network error",
			);
		});

		it("should handle 500 server errors", async () => {
			mockClient.request.mockRejectedValueOnce(
				new Error("API request failed: 500 Internal Server Error"),
			);

			await expect(service.execute()).rejects.toThrow(
				"Failed to get portfolio positions",
			);
		});
	});

	describe("format", () => {
		it("should format portfolio positions with all details", () => {
			const formatted = service.format(mockPortfolioResponse);

			expect(formatted).toContain("💼 Portfolio Positions");
			expect(formatted).toContain("Will Bitcoin reach $100k?");
			expect(formatted).toContain("Yes");
			expect(formatted).toContain("Quantity: 100");
			expect(formatted).toContain("Avg Price: 0.6500");
			expect(formatted).toContain("Current Price: 0.7200");
			expect(formatted).toContain("+$7.00");
			expect(formatted).toContain("+10.77%");
		});

		it("should format negative P&L correctly", () => {
			const formatted = service.format(mockPortfolioResponse);

			expect(formatted).toContain("Will Ethereum merge succeed?");
			expect(formatted).toContain("No");
			expect(formatted).toContain("-$2.50");
			expect(formatted).toContain("-16.67%");
		});

		it("should format portfolio summary", () => {
			const formatted = service.format(mockPortfolioResponse);

			expect(formatted).toContain("📊 Portfolio Summary:");
			expect(formatted).toContain("Total Value: $1000.00");
			expect(formatted).toContain("Total P&L: +$4.50");
			expect(formatted).toContain("+0.45%");
			expect(formatted).toContain("Active Positions: 2");
		});

		it("should handle empty portfolio", () => {
			const emptyPortfolio = {
				positions: [],
				totalValue: 0,
				totalPnl: 0,
				totalPnlPercent: 0,
			};

			const formatted = service.format(emptyPortfolio);

			expect(formatted).toContain("No active positions found");
		});

		it("should handle negative total P&L", () => {
			const negativePortfolio = {
				positions: [
					{
						market: "Test Market",
						outcome: "Yes",
						quantity: 10,
						avgPrice: 0.5,
						currentPrice: 0.3,
						pnl: -2.0,
						pnlPercent: -40.0,
					},
				],
				totalValue: 100.0,
				totalPnl: -2.0,
				totalPnlPercent: -2.0,
			};

			const formatted = service.format(negativePortfolio);

			expect(formatted).toContain("Total P&L: -$2.00");
			expect(formatted).toContain("-2.00%");
			expect(formatted).not.toContain("+-");
		});
	});
});
