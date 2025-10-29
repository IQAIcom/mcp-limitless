import { beforeEach, describe, expect, it, vi } from "vitest";
import { GetMarketService } from "../../../src/services/get-market.js";
import {
	marketDetailResolvedResponse,
	marketDetailSuccessResponse,
} from "../../helpers/fixtures/index.js";
import { assertContainsAll } from "../../helpers/index.js";

// Mock the client module
vi.mock("../../../src/lib/client.js", () => ({
	client: {
		request: vi.fn(),
	},
}));

// Import after mocking
import { client } from "../../../src/lib/client.js";

describe("GetMarketService", () => {
	let service: GetMarketService;
	const mockClient = client as any;

	beforeEach(() => {
		service = new GetMarketService();
		vi.clearAllMocks();
	});

	describe("execute", () => {
		it("should get market details by slug", async () => {
			mockClient.request.mockResolvedValueOnce(marketDetailSuccessResponse);

			const result = await service.execute("bitcoin-100k-2024");

			expect(mockClient.request).toHaveBeenCalledWith(
				"/markets/bitcoin-100k-2024",
			);
			expect(result).toEqual(marketDetailSuccessResponse);
			expect(result.slug).toBe("bitcoin-100k-2024");
			expect(result.question).toContain("Bitcoin");
		});

		it("should get market details by address", async () => {
			mockClient.request.mockResolvedValueOnce(marketDetailSuccessResponse);

			const result = await service.execute("0x1234567890abcdef");

			expect(mockClient.request).toHaveBeenCalledWith(
				"/markets/0x1234567890abcdef",
			);
			expect(result).toEqual(marketDetailSuccessResponse);
		});

		it("should throw error when market not found", async () => {
			mockClient.request.mockResolvedValueOnce(null);

			await expect(service.execute("nonexistent-market")).rejects.toThrow(
				"Market not found",
			);
		});

		it("should handle 404 errors from API", async () => {
			mockClient.request.mockRejectedValueOnce(
				new Error("API request failed: 404 Not Found"),
			);

			await expect(service.execute("nonexistent-market")).rejects.toThrow(
				"Failed to get market",
			);
		});

		it("should handle network errors", async () => {
			mockClient.request.mockRejectedValueOnce(new Error("Network timeout"));

			await expect(service.execute("bitcoin-100k-2024")).rejects.toThrow(
				"Failed to get market: Network timeout",
			);
		});

		it("should handle API server errors", async () => {
			mockClient.request.mockRejectedValueOnce(
				new Error("API request failed: 500 Internal Server Error"),
			);

			await expect(service.execute("bitcoin-100k-2024")).rejects.toThrow(
				"Failed to get market",
			);
		});
	});

	describe("format", () => {
		it("should format market details with all fields", () => {
			const formatted = service.format(marketDetailSuccessResponse);

			assertContainsAll(formatted, [
				"Market Details",
				"Will Bitcoin reach $100,000",
				"Slug: bitcoin-100k-2024",
				"Address: 0x1234567890abcdef",
				"Category: Crypto",
				"Volume: $125000",
				"Liquidity: $50000",
				"limitless.exchange/markets/bitcoin-100k-2024",
			]);

			// Check for description
			expect(formatted).toContain("This market resolves to YES");
		});

		it("should format resolved market with outcome", () => {
			const formatted = service.format(marketDetailResolvedResponse);

			assertContainsAll(formatted, ["Market Details", "bitcoin-100k-2024"]);
		});

		it("should format market with outcomes/prices", () => {
			const marketWithOutcomes = {
				...marketDetailSuccessResponse,
				outcomes: [
					{ name: "YES", price: "0.65" },
					{ name: "NO", price: "0.35" },
				],
			};

			const formatted = service.format(marketWithOutcomes);

			assertContainsAll(formatted, ["Outcomes:", "YES: 0.65", "NO: 0.35"]);
		});

		it("should handle market with minimal fields", () => {
			const minimalMarket = {
				question: "Simple question?",
				slug: "simple-market",
				address: "0xabc",
			};

			const formatted = service.format(minimalMarket);

			assertContainsAll(formatted, [
				"Simple question?",
				"simple-market",
				"0xabc",
			]);

			// Should not include optional fields
			expect(formatted).not.toContain("Category:");
			expect(formatted).not.toContain("Description:");
			expect(formatted).not.toContain("Volume:");
		});

		it("should format dates correctly", () => {
			const formatted = service.format(marketDetailSuccessResponse);

			// Should contain end date in locale string format
			expect(formatted).toContain("End Date:");
		});

		it("should format market type and status when present", () => {
			const marketWithTypeStatus = {
				...marketDetailSuccessResponse,
				marketType: "Binary",
				status: "Active",
			};

			const formatted = service.format(marketWithTypeStatus);

			assertContainsAll(formatted, ["Type: Binary", "Status: Active"]);
		});
	});
});
