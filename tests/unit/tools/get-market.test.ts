import { beforeEach, describe, expect, it, vi } from "vitest";
import { getMarketTool } from "../../../src/tools/get-market.js";
import {
	marketDetailResolvedResponse,
	marketDetailSuccessResponse,
} from "../../helpers/fixtures/index.js";

// Mock the service
const mockExecute = vi.fn();
const mockFormat = vi.fn();

vi.mock("../../../src/services/get-market.js", () => ({
	GetMarketService: vi.fn().mockImplementation(() => ({
		execute: mockExecute,
		format: mockFormat,
	})),
}));

import { GetMarketService } from "../../../src/services/get-market.js";

describe("getMarketTool", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("metadata", () => {
		it("should have correct tool name", () => {
			expect(getMarketTool.name).toBe("GET_MARKET");
		});

		it("should have a description", () => {
			expect(getMarketTool.description).toBeTruthy();
			expect(getMarketTool.description).toContain("market");
		});

		it("should have parameters schema", () => {
			expect(getMarketTool.parameters).toBeDefined();
		});
	});

	describe("parameter validation", () => {
		it("should validate slug parameter", () => {
			const result = getMarketTool.parameters.safeParse({
				addressOrSlug: "bitcoin-100k-2024",
			});
			expect(result.success).toBe(true);
		});

		it("should validate address parameter", () => {
			const result = getMarketTool.parameters.safeParse({
				addressOrSlug: "0x1234567890abcdef",
			});
			expect(result.success).toBe(true);
		});

		it("should reject empty string", () => {
			const result = getMarketTool.parameters.safeParse({
				addressOrSlug: "",
			});
			expect(result.success).toBe(false);
		});

		it("should reject missing parameter", () => {
			const result = getMarketTool.parameters.safeParse({});
			expect(result.success).toBe(false);
		});

		it("should reject invalid types", () => {
			const result = getMarketTool.parameters.safeParse({
				addressOrSlug: 123,
			});
			expect(result.success).toBe(false);
		});
	});

	describe("execute", () => {
		it("should get market by slug", async () => {
			mockExecute.mockResolvedValueOnce(marketDetailSuccessResponse);
			mockFormat.mockReturnValueOnce("Formatted market details");

			const result = await getMarketTool.execute({
				addressOrSlug: "bitcoin-100k-2024",
			});

			expect(mockExecute).toHaveBeenCalledWith("bitcoin-100k-2024");
			expect(mockFormat).toHaveBeenCalledWith(marketDetailSuccessResponse);
			expect(result).toBe("Formatted market details");
		});

		it("should get market by address", async () => {
			mockExecute.mockResolvedValueOnce(marketDetailSuccessResponse);
			mockFormat.mockReturnValueOnce("Formatted market details");

			const result = await getMarketTool.execute({
				addressOrSlug: "0x1234567890abcdef",
			});

			expect(mockExecute).toHaveBeenCalledWith("0x1234567890abcdef");
			expect(result).toBe("Formatted market details");
		});

		it("should handle resolved markets", async () => {
			mockExecute.mockResolvedValueOnce(marketDetailResolvedResponse);
			mockFormat.mockReturnValueOnce("Resolved market details");

			const result = await getMarketTool.execute({
				addressOrSlug: "bitcoin-100k-2024",
			});

			expect(result).toBe("Resolved market details");
		});

		it("should handle market not found errors", async () => {
			mockExecute.mockRejectedValueOnce(
				new Error("Failed to get market: Market not found"),
			);

			const result = await getMarketTool.execute({
				addressOrSlug: "nonexistent-market",
			});

			expect(result).toContain("Error retrieving market");
			expect(result).toContain("Market not found");
		});

		it("should handle API errors gracefully", async () => {
			mockExecute.mockRejectedValueOnce(
				new Error("API request failed: 500 Internal Server Error"),
			);

			const result = await getMarketTool.execute({
				addressOrSlug: "bitcoin-100k-2024",
			});

			expect(result).toContain("Error retrieving market");
			expect(result).toContain("API request failed");
		});

		it("should handle network errors", async () => {
			mockExecute.mockRejectedValueOnce(new Error("Network timeout"));

			const result = await getMarketTool.execute({
				addressOrSlug: "bitcoin-100k-2024",
			});

			expect(result).toContain("Error retrieving market");
			expect(result).toContain("Network timeout");
		});

		it("should handle unknown errors", async () => {
			mockExecute.mockRejectedValueOnce("Unknown error");

			const result = await getMarketTool.execute({
				addressOrSlug: "bitcoin-100k-2024",
			});

			expect(result).toContain("unknown error");
		});

		it("should log errors to console", async () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
			mockExecute.mockRejectedValueOnce(new Error("Test error"));

			await getMarketTool.execute({
				addressOrSlug: "bitcoin-100k-2024",
			});

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("Error in GET_MARKET tool"),
			);

			consoleSpy.mockRestore();
		});
	});

	describe("integration scenarios", () => {
		it("should handle complete successful flow", async () => {
			mockExecute.mockResolvedValueOnce(marketDetailSuccessResponse);
			mockFormat.mockImplementation((market) => {
				return `Market: ${market.question}`;
			});

			const result = await getMarketTool.execute({
				addressOrSlug: "bitcoin-100k-2024",
			});

			expect(result).toContain("Market:");
			expect(result).toContain("Bitcoin");
		});

		it("should work with both slug and address formats", async () => {
			mockExecute.mockResolvedValueOnce(marketDetailSuccessResponse);
			mockFormat.mockReturnValueOnce("Result");

			await getMarketTool.execute({
				addressOrSlug: "bitcoin-100k-2024",
			});
			expect(mockExecute).toHaveBeenCalledWith("bitcoin-100k-2024");

			mockExecute.mockResolvedValueOnce(marketDetailSuccessResponse);
			await getMarketTool.execute({
				addressOrSlug: "0xabc123",
			});
			expect(mockExecute).toHaveBeenCalledWith("0xabc123");
		});
	});
});
