import { z } from "zod";
import { GetPortfolioPointsService } from "../services/get-portfolio-points.js";

const getPortfolioPointsParams = z.object({
	apiKey: z
		.string()
		.optional()
		.describe("API key or bearer token for authentication (required)"),
});

type GetPortfolioPointsParams = z.infer<typeof getPortfolioPointsParams>;

export const getPortfolioPointsTool = {
	name: "GET_PORTFOLIO_POINTS",
	description:
		"Get points breakdown for the authenticated user. Requires authentication.",
	parameters: getPortfolioPointsParams,
	execute: async (params: GetPortfolioPointsParams) => {
		try {
			const service = new GetPortfolioPointsService();
			const response = await service.execute(params.apiKey);

			return service.format(response);
		} catch (error) {
			if (error instanceof Error) {
				console.log(`Error in GET_PORTFOLIO_POINTS tool: ${error.message}`);
				return `Error getting portfolio points: ${error.message}`;
			}
			return "An unknown error occurred while fetching portfolio points";
		}
	},
} as const;
