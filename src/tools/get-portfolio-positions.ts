import { z } from "zod";
import { GetPortfolioPositionsService } from "../services/get-portfolio-positions.js";

const getPortfolioPositionsParams = z.object({});

type GetPortfolioPositionsParams = z.infer<typeof getPortfolioPositionsParams>;

export const getPortfolioPositionsTool = {
	name: "GET_PORTFOLIO_POSITIONS",
	description:
		"Get your active portfolio positions on Limitless with P&L calculations and market values. Requires authentication via session token.",
	parameters: getPortfolioPositionsParams,
	execute: async (params: GetPortfolioPositionsParams) => {
		try {
			const service = new GetPortfolioPositionsService();
			const portfolio = await service.execute();

			return service.format(portfolio);
		} catch (error) {
			if (error instanceof Error) {
				console.log(`Error in GET_PORTFOLIO_POSITIONS tool: ${error.message}`);
				return `Error retrieving portfolio positions: ${error.message}`;
			}
			return "An unknown error occurred while fetching portfolio data";
		}
	},
} as const;
