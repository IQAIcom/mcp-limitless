import { z } from "zod";
import { GetPortfolioTradesService } from "../services/get-portfolio-trades.js";

const getPortfolioTradesParams = z.object({});

type GetPortfolioTradesParams = z.infer<typeof getPortfolioTradesParams>;

export const getPortfolioTradesTool = {
	name: "GET_PORTFOLIO_TRADES",
	description:
		"Retrieve all trades executed by the authenticated user. Requires authentication.",
	parameters: getPortfolioTradesParams,
	execute: async (params: GetPortfolioTradesParams) => {
		try {
			const service = new GetPortfolioTradesService();
			const response = await service.execute();

			return service.format(response);
		} catch (error) {
			if (error instanceof Error) {
				console.log(`Error in GET_PORTFOLIO_TRADES tool: ${error.message}`);
				return `Error getting portfolio trades: ${error.message}`;
			}
			return "An unknown error occurred while fetching portfolio trades";
		}
	},
} as const;
