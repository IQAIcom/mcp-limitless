import { beforeEach, describe, expect, it, vi } from "vitest";
import { getActiveMarketsTool } from "../../../src/tools/get-active-markets.js";

// Mock the service
const mockExecute = vi.fn();
const mockFormat = vi.fn();

vi.mock("../../../src/services/get-active-markets.js", () => ({
	GetActiveMarketsService: vi.fn().mockImplementation(() => ({
		execute: mockExecute,
		format: mockFormat,
	})),
}));

import { GetActiveMarketsService } from "../../../src/services/get-active-markets.js";

describe("getActiveMarketsTool", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("metadata", () => {
		it("should have correct tool name", () => {
			expect(getActiveMarketsTool.name).toBe("GET_ACTIVE_MARKETS");
		});

		it("should have a description", () => {
			expect(getActiveMarketsTool.description).toBeTruthy();
			expect(getActiveMarketsTool.description).toContain(
				"active (unresolved) prediction markets",
			);
		});

		it("should have parameters schema", () => {
			expect(getActiveMarketsTool.parameters).toBeDefined();
		});
	});

	describe("parameter validation", () => {
		it("should accept empty parameters", () => {
			const result = getActiveMarketsTool.parameters.safeParse({});
			expect(result.success).toBe(true);
		});

		it("should accept categoryId parameter", () => {
			const result = getActiveMarketsTool.parameters.safeParse({
				categoryId: 5,
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.categoryId).toBe(5);
			}
		});

		it("should accept page parameter", () => {
			const result = getActiveMarketsTool.parameters.safeParse({
				page: 2,
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.page).toBe(2);
			}
		});

		it("should accept limit parameter", () => {
			const result = getActiveMarketsTool.parameters.safeParse({
				limit: 20,
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.limit).toBe(20);
			}
		});

		it("should accept sortBy parameter", () => {
			const result = getActiveMarketsTool.parameters.safeParse({
				sortBy: "volume",
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.sortBy).toBe("volume");
			}
		});

		it("should reject invalid parameter types", () => {
			const result = getActiveMarketsTool.parameters.safeParse({
				categoryId: "not a number",
			});
			expect(result.success).toBe(false);
		});
	});

	describe("execute", () => {
		it("should execute and return formatted results", async () => {
			const mockResponse = {
				markets: [],
				total: 0,
				page: 1,
				limit: 10,
			};
			mockExecute.mockResolvedValueOnce(mockResponse);
			mockFormat.mockReturnValueOnce("Formatted results");

			const result = await getActiveMarketsTool.execute({});

			expect(mockExecute).toHaveBeenCalledWith(
				undefined,
				undefined,
				undefined,
				undefined,
			);
			expect(mockFormat).toHaveBeenCalledWith(mockResponse);
			expect(result).toBe("Formatted results");
		});

		it("should pass all parameters to service", async () => {
			const mockResponse = {
				markets: [],
				total: 0,
				page: 2,
				limit: 5,
			};
			mockExecute.mockResolvedValueOnce(mockResponse);
			mockFormat.mockReturnValueOnce("Formatted results");

			await getActiveMarketsTool.execute({
				categoryId: 5,
				page: 2,
				limit: 5,
				sortBy: "volume",
			});

			expect(mockExecute).toHaveBeenCalledWith(5, 2, 5, "volume");
		});

		it("should handle empty results", async () => {
			const mockResponse = {
				markets: [],
				total: 0,
				page: 1,
				limit: 10,
			};
			mockExecute.mockResolvedValueOnce(mockResponse);
			mockFormat.mockReturnValueOnce("No active markets found");

			const result = await getActiveMarketsTool.execute({});

			expect(result).toContain("No active markets found");
		});

		it("should handle service errors gracefully", async () => {
			mockExecute.mockRejectedValueOnce(new Error("API connection failed"));

			const result = await getActiveMarketsTool.execute({});

			expect(result).toContain("Error retrieving active markets");
			expect(result).toContain("API connection failed");
		});

		it("should handle unknown errors", async () => {
			mockExecute.mockRejectedValueOnce("Unknown error");

			const result = await getActiveMarketsTool.execute({});

			expect(result).toContain("unknown error");
		});

		it("should log errors to console", async () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
			mockExecute.mockRejectedValueOnce(new Error("Test error"));

			await getActiveMarketsTool.execute({});

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("Error in GET_ACTIVE_MARKETS tool"),
			);

			consoleSpy.mockRestore();
		});
	});

	describe("integration scenarios", () => {
		it("should handle complete successful flow", async () => {
			const mockResponse = {
				markets: [
					{
						question: "Test market",
						slug: "test-market",
					},
				],
				total: 1,
				page: 1,
				limit: 10,
			};
			mockExecute.mockResolvedValueOnce(mockResponse);
			mockFormat.mockImplementation((response) => {
				return `Found ${response.markets.length} markets`;
			});

			const result = await getActiveMarketsTool.execute({});

			expect(result).toContain("Found");
			expect(result).toContain("markets");
		});

		it("should work with category filter", async () => {
			const mockResponse = {
				markets: [],
				total: 0,
				page: 1,
				limit: 10,
			};
			mockExecute.mockResolvedValueOnce(mockResponse);
			mockFormat.mockReturnValueOnce("Results");

			const result = await getActiveMarketsTool.execute({
				categoryId: 3,
			});

			expect(result).toBe("Results");
			expect(mockExecute).toHaveBeenCalledWith(
				3,
				undefined,
				undefined,
				undefined,
			);
		});
	});
});
