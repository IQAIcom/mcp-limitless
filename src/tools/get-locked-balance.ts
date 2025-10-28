import { z } from "zod";
import { GetLockedBalanceService } from "../services/get-locked-balance.js";

const getLockedBalanceParams = z.object({
	slug: z.string().describe("Market slug identifier"),
	apiKey: z
		.string()
		.optional()
		.describe("API key or bearer token for authentication (required)"),
});

type GetLockedBalanceParams = z.infer<typeof getLockedBalanceParams>;

export const getLockedBalanceTool = {
	name: "GET_LOCKED_BALANCE",
	description:
		"Get the amount of funds locked in open orders for the authenticated user in a specific market. Requires authentication.",
	parameters: getLockedBalanceParams,
	execute: async (params: GetLockedBalanceParams) => {
		try {
			const service = new GetLockedBalanceService();
			const response = await service.execute(params.slug, params.apiKey);

			return service.format(response, params.slug);
		} catch (error) {
			if (error instanceof Error) {
				console.log(`Error in GET_LOCKED_BALANCE tool: ${error.message}`);
				return `Error getting locked balance: ${error.message}`;
			}
			return "An unknown error occurred while fetching locked balance";
		}
	},
} as const;
