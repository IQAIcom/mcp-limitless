import { z } from "zod";
import { GetHistoricalPriceService } from "../services/get-historical-price.js";

const getHistoricalPriceParams = z.object({
	slug: z.string().describe("Market slug identifier"),
	from: z
		.string()
		.optional()
		.describe("Start date for historical data (ISO 8601 format)"),
	to: z
		.string()
		.optional()
		.describe("End date for historical data (ISO 8601 format)"),
	interval: z
		.enum(["1h", "6h", "1d", "1w", "1m", "all"])
		.optional()
		.describe("Time interval for data points"),
});

type GetHistoricalPriceParams = z.infer<typeof getHistoricalPriceParams>;

export const getHistoricalPriceTool = {
	name: "GET_HISTORICAL_PRICE",
	description:
		"Retrieve historical price data for a specific market with configurable time intervals. Useful for analyzing price trends.",
	parameters: getHistoricalPriceParams,
	execute: async (params: GetHistoricalPriceParams) => {
		try {
			const service = new GetHistoricalPriceService();
			const response = await service.execute(params);

			return service.format(response, params.slug);
		} catch (error) {
			if (error instanceof Error) {
				console.log(`Error in GET_HISTORICAL_PRICE tool: ${error.message}`);
				return `Error getting historical prices: ${error.message}`;
			}
			return "An unknown error occurred while fetching historical prices";
		}
	},
} as const;
