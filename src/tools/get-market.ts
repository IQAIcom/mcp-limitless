import { z } from "zod";
import { GetMarketService } from "../services/get-market.js";

const getMarketParams = z.object({
	addressOrSlug: z
		.string()
		.min(1)
		.describe(
			"Market address (0x...) or slug identifier (e.g., crypto-predictions-2025)",
		),
});

type GetMarketParams = z.infer<typeof getMarketParams>;

export const getMarketTool = {
	name: "GET_MARKET",
	description:
		"Get detailed information about a specific prediction market on Limitless. Provides market question, outcomes, prices, volume, liquidity, and other trading data.",
	parameters: getMarketParams,
	execute: async (params: GetMarketParams) => {
		try {
			const service = new GetMarketService();
			const market = await service.execute(params.addressOrSlug);

			return service.format(market);
		} catch (error) {
			if (error instanceof Error) {
				console.log(`Error in GET_MARKET tool: ${error.message}`);
				return `Error retrieving market: ${error.message}`;
			}
			return "An unknown error occurred while fetching market data";
		}
	},
} as const;
