import { z } from "zod";
import { SearchMarketsService } from "../services/search-markets.js";

const searchMarketsParams = z.object({
	query: z.string().min(1).describe("The search query for markets"),
	limit: z
		.number()
		.optional()
		.describe("Maximum number of results (default: 10)"),
	page: z
		.number()
		.optional()
		.describe("Page number for pagination (default: 1)"),
	similarityThreshold: z
		.number()
		.optional()
		.describe("Minimum similarity score 0-1 (default: 0.5)"),
});

type SearchMarketsParams = z.infer<typeof searchMarketsParams>;

export const searchMarketsTool = {
	name: "SEARCH_MARKETS",
	description:
		"Search for prediction markets on Limitless based on semantic similarity. Returns markets matching the search query with details like volume, liquidity, and end dates.",
	parameters: searchMarketsParams,
	execute: async (params: SearchMarketsParams) => {
		try {
			const service = new SearchMarketsService();
			const result = await service.execute(
				params.query,
				params.limit,
				params.page,
				params.similarityThreshold,
			);

			return service.format(result);
		} catch (error) {
			if (error instanceof Error) {
				console.log(`Error in SEARCH_MARKETS tool: ${error.message}`);
				return `Error searching markets: ${error.message}`;
			}
			return "An unknown error occurred while searching for markets";
		}
	},
} as const;
