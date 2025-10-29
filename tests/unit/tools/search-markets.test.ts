import { beforeEach, describe, expect, it, vi } from "vitest";
import { searchMarketsTool } from "../../../src/tools/search-markets.js";
import {
	searchMarketsEmptyResponse,
	searchMarketsSuccessResponse,
} from "../../helpers/fixtures/index.js";
import { assertContainsAll } from "../../helpers/index.js";

// Mock the service
const mockExecute = vi.fn();
const mockFormat = vi.fn();

vi.mock("../../../src/services/search-markets.js", () => ({
	SearchMarketsService: vi.fn().mockImplementation(() => ({
		execute: mockExecute,
		format: mockFormat,
	})),
}));

import { SearchMarketsService } from "../../../src/services/search-markets.js";

describe("searchMarketsTool", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("metadata", () => {
		it("should have correct tool name", () => {
			expect(searchMarketsTool.name).toBe("SEARCH_MARKETS");
		});

		it("should have a description", () => {
			expect(searchMarketsTool.description).toBeTruthy();
			expect(searchMarketsTool.description).toContain(
				"Search for prediction markets",
			);
		});

		it("should have parameters schema", () => {
			expect(searchMarketsTool.parameters).toBeDefined();
		});
	});

	describe("parameter validation", () => {
		it("should validate required query parameter", () => {
			const result = searchMarketsTool.parameters.safeParse({
				query: "bitcoin",
			});
			expect(result.success).toBe(true);
		});

		it("should reject empty query string", () => {
			const result = searchMarketsTool.parameters.safeParse({
				query: "",
			});
			expect(result.success).toBe(false);
		});

		it("should reject missing query parameter", () => {
			const result = searchMarketsTool.parameters.safeParse({});
			expect(result.success).toBe(false);
		});

		it("should accept optional limit parameter", () => {
			const result = searchMarketsTool.parameters.safeParse({
				query: "bitcoin",
				limit: 20,
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.limit).toBe(20);
			}
		});

		it("should accept optional page parameter", () => {
			const result = searchMarketsTool.parameters.safeParse({
				query: "bitcoin",
				page: 2,
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.page).toBe(2);
			}
		});

		it("should accept optional similarityThreshold parameter", () => {
			const result = searchMarketsTool.parameters.safeParse({
				query: "bitcoin",
				similarityThreshold: 0.8,
			});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.similarityThreshold).toBe(0.8);
			}
		});

		it("should reject invalid parameter types", () => {
			const result = searchMarketsTool.parameters.safeParse({
				query: "bitcoin",
				limit: "not a number",
			});
			expect(result.success).toBe(false);
		});
	});

	describe("execute", () => {
		it("should execute search and return formatted results", async () => {
			mockExecute.mockResolvedValueOnce(searchMarketsSuccessResponse);
			mockFormat.mockReturnValueOnce("Formatted results");

			const result = await searchMarketsTool.execute({
				query: "bitcoin",
			});

			expect(mockExecute).toHaveBeenCalledWith(
				"bitcoin",
				undefined,
				undefined,
				undefined,
			);
			expect(mockFormat).toHaveBeenCalledWith(searchMarketsSuccessResponse);
			expect(result).toBe("Formatted results");
		});

		it("should pass all parameters to service", async () => {
			mockExecute.mockResolvedValueOnce(searchMarketsSuccessResponse);
			mockFormat.mockReturnValueOnce("Formatted results");

			await searchMarketsTool.execute({
				query: "ethereum",
				limit: 5,
				page: 2,
				similarityThreshold: 0.7,
			});

			expect(mockExecute).toHaveBeenCalledWith("ethereum", 5, 2, 0.7);
		});

		it("should handle empty results", async () => {
			mockExecute.mockResolvedValueOnce(searchMarketsEmptyResponse);
			mockFormat.mockReturnValueOnce("No markets found");

			const result = await searchMarketsTool.execute({
				query: "nonexistent",
			});

			expect(result).toContain("No markets found");
		});

		it("should handle service errors gracefully", async () => {
			mockExecute.mockRejectedValueOnce(new Error("API connection failed"));

			const result = await searchMarketsTool.execute({
				query: "bitcoin",
			});

			expect(result).toContain("Error searching markets");
			expect(result).toContain("API connection failed");
		});

		it("should handle unknown errors", async () => {
			mockExecute.mockRejectedValueOnce("Unknown error");

			const result = await searchMarketsTool.execute({
				query: "bitcoin",
			});

			expect(result).toContain("unknown error");
		});

		it("should log errors to console", async () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
			mockExecute.mockRejectedValueOnce(new Error("Test error"));

			await searchMarketsTool.execute({
				query: "bitcoin",
			});

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("Error in SEARCH_MARKETS tool"),
			);

			consoleSpy.mockRestore();
		});
	});

	describe("integration scenarios", () => {
		it("should handle complete successful search flow", async () => {
			mockExecute.mockResolvedValueOnce(searchMarketsSuccessResponse);
			mockFormat.mockImplementation((response) => {
				return `Found ${response.markets.length} markets`;
			});

			const result = await searchMarketsTool.execute({
				query: "bitcoin",
				limit: 10,
			});

			assertContainsAll(result, ["Found", "markets"]);
		});

		it("should work with minimal parameters", async () => {
			mockExecute.mockResolvedValueOnce(searchMarketsSuccessResponse);
			mockFormat.mockReturnValueOnce("Results");

			const result = await searchMarketsTool.execute({
				query: "test",
			});

			expect(result).toBe("Results");
			expect(mockExecute).toHaveBeenCalledWith(
				"test",
				undefined,
				undefined,
				undefined,
			);
		});
	});
});
