import { z } from "zod";
import { GetActiveMarketsService } from "../services/get-active-markets.js";

const getActiveMarketsParams = z.object({
	categoryId: z
		.number()
		.optional()
		.describe("Filter by category ID (optional)"),
	page: z
		.number()
		.optional()
		.describe("Page number for pagination (default: 1)"),
	limit: z
		.number()
		.optional()
		.describe("Number of results per page (default: 10)"),
	sortBy: z
		.string()
		.optional()
		.describe(
			"Sort order: newest, oldest, volume, liquidity (default: newest)",
		),
});

type GetActiveMarketsParams = z.infer<typeof getActiveMarketsParams>;

export const getActiveMarketsTool = {
	name: "GET_ACTIVE_MARKETS",
	description:
		"Browse active (unresolved) prediction markets on Limitless. Returns markets with volume, liquidity, and other trading data. Supports filtering by category and sorting.",
	parameters: getActiveMarketsParams,
	execute: async (params: GetActiveMarketsParams) => {
		try {
			const service = new GetActiveMarketsService();
			const result = await service.execute(
				params.categoryId,
				params.page,
				params.limit,
				params.sortBy,
			);

			return service.format(result);
		} catch (error) {
			if (error instanceof Error) {
				console.log(`Error in GET_ACTIVE_MARKETS tool: ${error.message}`);
				return `Error retrieving active markets: ${error.message}`;
			}
			return "An unknown error occurred while fetching active markets";
		}
	},
} as const;
