import { z } from "zod";
import { GetMarketEventsService } from "../services/get-market-events.js";

const getMarketEventsParams = z.object({
	slug: z.string().describe("Market slug identifier"),
	page: z.number().optional().describe("Page number for pagination"),
	limit: z.number().optional().describe("Number of events per page"),
});

type GetMarketEventsParams = z.infer<typeof getMarketEventsParams>;

export const getMarketEventsTool = {
	name: "GET_MARKET_EVENTS",
	description:
		"Get recent events for a specific market including trades, orders, and liquidity changes.",
	parameters: getMarketEventsParams,
	execute: async (params: GetMarketEventsParams) => {
		try {
			const service = new GetMarketEventsService();
			const response = await service.execute(params);

			return service.format(response, params.slug);
		} catch (error) {
			if (error instanceof Error) {
				console.log(`Error in GET_MARKET_EVENTS tool: ${error.message}`);
				return `Error getting market events: ${error.message}`;
			}
			return "An unknown error occurred while fetching market events";
		}
	},
} as const;
