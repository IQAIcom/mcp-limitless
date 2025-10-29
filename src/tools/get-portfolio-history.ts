import { z } from "zod";
import { GetPortfolioHistoryService } from "../services/get-portfolio-history.js";

const getPortfolioHistoryParams = z.object({
	page: z.number().describe("Page number for pagination"),
	limit: z.number().describe("Number of items per page"),
	from: z
		.string()
		.optional()
		.describe("Start date for filtering (ISO 8601 format)"),
	to: z
		.string()
		.optional()
		.describe("End date for filtering (ISO 8601 format)"),
});

type GetPortfolioHistoryParams = z.infer<typeof getPortfolioHistoryParams>;

export const getPortfolioHistoryTool = {
	name: "GET_PORTFOLIO_HISTORY",
	description:
		"Get paginated history including AMM trades, CLOB trades, splits/merges, and NegRisk conversions. Requires authentication.",
	parameters: getPortfolioHistoryParams,
	execute: async (params: GetPortfolioHistoryParams) => {
		try {
			const service = new GetPortfolioHistoryService();
			const response = await service.execute(params);

			return service.format(response);
		} catch (error) {
			if (error instanceof Error) {
				console.log(`Error in GET_PORTFOLIO_HISTORY tool: ${error.message}`);
				return `Error getting portfolio history: ${error.message}`;
			}
			return "An unknown error occurred while fetching portfolio history";
		}
	},
} as const;
