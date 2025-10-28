import { z } from "zod";
import { GetMarketOrderbookService } from "../services/get-market-orderbook.js";

const getMarketOrderbookParams = z.object({
	slug: z
		.string()
		.min(1)
		.describe("Market slug identifier (e.g., presidential-election-2024)"),
});

type GetMarketOrderbookParams = z.infer<typeof getMarketOrderbookParams>;

export const getMarketOrderbookTool = {
	name: "GET_MARKET_ORDERBOOK",
	description:
		"Get the current orderbook for a prediction market on Limitless. Shows all open buy (bids) and sell (asks) orders with prices and sizes.",
	parameters: getMarketOrderbookParams,
	execute: async (params: GetMarketOrderbookParams) => {
		try {
			const service = new GetMarketOrderbookService();
			const orderbook = await service.execute(params.slug);

			return service.format(orderbook);
		} catch (error) {
			if (error instanceof Error) {
				console.log(`Error in GET_MARKET_ORDERBOOK tool: ${error.message}`);
				return `Error retrieving orderbook: ${error.message}`;
			}
			return "An unknown error occurred while fetching orderbook data";
		}
	},
} as const;
