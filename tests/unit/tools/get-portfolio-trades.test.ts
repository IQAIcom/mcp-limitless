import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPortfolioTradesTool } from "../../../src/tools/get-portfolio-trades.js";

// Mock the service
const mockExecute = vi.fn();
const mockFormat = vi.fn();

vi.mock("../../../src/services/get-portfolio-trades.js", () => ({
	GetPortfolioTradesService: vi.fn().mockImplementation(() => ({
		execute: mockExecute,
		format: mockFormat,
	})),
}));

import { GetPortfolioTradesService } from "../../../src/services/get-portfolio-trades.js";

describe("getPortfolioTradesTool", () => {
	beforeEach(() => {
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
		],
	};

	describe("metadata", () => {
		it("should have correct tool name", () => {
			expect(getPortfolioTradesTool.name).toBe("GET_PORTFOLIO_TRADES");
		});

		it("should have a description", () => {
			expect(getPortfolioTradesTool.description).toBeTruthy();
			expect(getPortfolioTradesTool.description).toContain("trades");
		});

		it("should have parameters schema", () => {
			expect(getPortfolioTradesTool.parameters).toBeDefined();
		});
	});

	describe("parameter validation", () => {
		it("should validate optional apiKey parameter", () => {
			const result = getPortfolioTradesTool.parameters.safeParse({
				apiKey: "test-api-key",
			});
			expect(result.success).toBe(true);
		});

		it("should accept empty parameters", () => {
			const result = getPortfolioTradesTool.parameters.safeParse({});
			expect(result.success).toBe(true);
		});

		it("should reject invalid parameter types", () => {
			const result = getPortfolioTradesTool.parameters.safeParse({
				apiKey: 123,
			});
			expect(result.success).toBe(false);
		});
	});

	describe("execute", () => {
		it("should execute and return formatted trades", async () => {
			mockExecute.mockResolvedValueOnce(mockTradesResponse);
			mockFormat.mockReturnValueOnce("Formatted trades");

			const result = await getPortfolioTradesTool.execute({});

			expect(mockExecute).toHaveBeenCalledWith(undefined);
			expect(mockFormat).toHaveBeenCalledWith(mockTradesResponse);
			expect(result).toBe("Formatted trades");
		});

		it("should pass API key to service", async () => {
			mockExecute.mockResolvedValueOnce(mockTradesResponse);
			mockFormat.mockReturnValueOnce("Formatted trades");

			await getPortfolioTradesTool.execute({
				apiKey: "test-api-key",
			});

			expect(mockExecute).toHaveBeenCalledWith("test-api-key");
		});

		it("should handle empty trades", async () => {
			const emptyResponse = {
				trades: [],
			};
			mockExecute.mockResolvedValueOnce(emptyResponse);
			mockFormat.mockReturnValueOnce("No trades found");

			const result = await getPortfolioTradesTool.execute({});

			expect(result).toContain("No trades found");
		});

		it("should handle authentication errors", async () => {
			mockExecute.mockRejectedValueOnce(
				new Error("Unauthorized. This tool requires authentication"),
			);

			const result = await getPortfolioTradesTool.execute({});

			expect(result).toContain("Error getting portfolio trades");
			expect(result).toContain("Unauthorized");
		});

		it("should handle service errors gracefully", async () => {
			mockExecute.mockRejectedValueOnce(new Error("API connection failed"));

			const result = await getPortfolioTradesTool.execute({});

			expect(result).toContain("Error getting portfolio trades");
			expect(result).toContain("API connection failed");
		});

		it("should handle unknown errors", async () => {
			mockExecute.mockRejectedValueOnce("Unknown error");

			const result = await getPortfolioTradesTool.execute({});

			expect(result).toContain("unknown error");
		});

		it("should log errors to console", async () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
			mockExecute.mockRejectedValueOnce(new Error("Test error"));

			await getPortfolioTradesTool.execute({});

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("Error in GET_PORTFOLIO_TRADES tool"),
			);

			consoleSpy.mockRestore();
		});
	});

	describe("integration scenarios", () => {
		it("should handle complete successful flow", async () => {
			mockExecute.mockResolvedValueOnce(mockTradesResponse);
			mockFormat.mockImplementation((response) => {
				return `Found ${response.trades.length} trades`;
			});

			const result = await getPortfolioTradesTool.execute({
				apiKey: "test-api-key",
			});

			expect(result).toContain("Found 1 trades");
		});

		it("should work without API key", async () => {
			mockExecute.mockResolvedValueOnce(mockTradesResponse);
			mockFormat.mockReturnValueOnce("Trade data");

			const result = await getPortfolioTradesTool.execute({});

			expect(result).toBe("Trade data");
			expect(mockExecute).toHaveBeenCalledWith(undefined);
		});
	});
});
