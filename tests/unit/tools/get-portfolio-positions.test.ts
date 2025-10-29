import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPortfolioPositionsTool } from "../../../src/tools/get-portfolio-positions.js";

// Mock the service
const mockExecute = vi.fn();
const mockFormat = vi.fn();

vi.mock("../../../src/services/get-portfolio-positions.js", () => ({
	GetPortfolioPositionsService: vi.fn().mockImplementation(() => ({
		execute: mockExecute,
		format: mockFormat,
	})),
}));

import { GetPortfolioPositionsService } from "../../../src/services/get-portfolio-positions.js";

describe("getPortfolioPositionsTool", () => {
	beforeEach(() => {
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
		],
		totalValue: 1000.0,
		totalPnl: 7.0,
		totalPnlPercent: 0.7,
	};

	describe("metadata", () => {
		it("should have correct tool name", () => {
			expect(getPortfolioPositionsTool.name).toBe("GET_PORTFOLIO_POSITIONS");
		});

		it("should have a description", () => {
			expect(getPortfolioPositionsTool.description).toBeTruthy();
			expect(getPortfolioPositionsTool.description).toContain("portfolio");
		});

		it("should have parameters schema", () => {
			expect(getPortfolioPositionsTool.parameters).toBeDefined();
		});
	});

	describe("parameter validation", () => {
		it("should validate optional apiKey parameter", () => {
			const result = getPortfolioPositionsTool.parameters.safeParse({
				apiKey: "test-api-key",
			});
			expect(result.success).toBe(true);
		});

		it("should accept empty parameters", () => {
			const result = getPortfolioPositionsTool.parameters.safeParse({});
			expect(result.success).toBe(true);
		});

		it("should reject invalid parameter types", () => {
			const result = getPortfolioPositionsTool.parameters.safeParse({
				apiKey: 123,
			});
			expect(result.success).toBe(false);
		});
	});

	describe("execute", () => {
		it("should execute and return formatted portfolio positions", async () => {
			mockExecute.mockResolvedValueOnce(mockPortfolioResponse);
			mockFormat.mockReturnValueOnce("Formatted portfolio");

			const result = await getPortfolioPositionsTool.execute({});

			expect(mockExecute).toHaveBeenCalledWith(undefined);
			expect(mockFormat).toHaveBeenCalledWith(mockPortfolioResponse);
			expect(result).toBe("Formatted portfolio");
		});

		it("should pass API key to service", async () => {
			mockExecute.mockResolvedValueOnce(mockPortfolioResponse);
			mockFormat.mockReturnValueOnce("Formatted portfolio");

			await getPortfolioPositionsTool.execute({
				apiKey: "test-api-key",
			});

			expect(mockExecute).toHaveBeenCalledWith("test-api-key");
		});

		it("should handle empty portfolio", async () => {
			const emptyResponse = {
				positions: [],
				totalValue: 0,
				totalPnl: 0,
				totalPnlPercent: 0,
			};
			mockExecute.mockResolvedValueOnce(emptyResponse);
			mockFormat.mockReturnValueOnce("No active positions found");

			const result = await getPortfolioPositionsTool.execute({});

			expect(result).toContain("No active positions found");
		});

		it("should handle authentication errors", async () => {
			mockExecute.mockRejectedValueOnce(
				new Error("Unauthorized. This tool requires authentication"),
			);

			const result = await getPortfolioPositionsTool.execute({});

			expect(result).toContain("Error retrieving portfolio positions");
			expect(result).toContain("Unauthorized");
		});

		it("should handle service errors gracefully", async () => {
			mockExecute.mockRejectedValueOnce(new Error("API connection failed"));

			const result = await getPortfolioPositionsTool.execute({});

			expect(result).toContain("Error retrieving portfolio positions");
			expect(result).toContain("API connection failed");
		});

		it("should handle unknown errors", async () => {
			mockExecute.mockRejectedValueOnce("Unknown error");

			const result = await getPortfolioPositionsTool.execute({});

			expect(result).toContain("unknown error");
		});

		it("should log errors to console", async () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
			mockExecute.mockRejectedValueOnce(new Error("Test error"));

			await getPortfolioPositionsTool.execute({});

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("Error in GET_PORTFOLIO_POSITIONS tool"),
			);

			consoleSpy.mockRestore();
		});
	});

	describe("integration scenarios", () => {
		it("should handle complete successful flow", async () => {
			mockExecute.mockResolvedValueOnce(mockPortfolioResponse);
			mockFormat.mockImplementation((response) => {
				return `Found ${response.positions.length} positions`;
			});

			const result = await getPortfolioPositionsTool.execute({
				apiKey: "test-api-key",
			});

			expect(result).toContain("Found 1 positions");
		});

		it("should work without API key", async () => {
			mockExecute.mockResolvedValueOnce(mockPortfolioResponse);
			mockFormat.mockReturnValueOnce("Portfolio data");

			const result = await getPortfolioPositionsTool.execute({});

			expect(result).toBe("Portfolio data");
			expect(mockExecute).toHaveBeenCalledWith(undefined);
		});
	});
});
