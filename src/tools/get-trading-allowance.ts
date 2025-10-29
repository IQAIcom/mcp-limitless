import { z } from "zod";
import { GetTradingAllowanceService } from "../services/get-trading-allowance.js";

const getTradingAllowanceParams = z.object({
	type: z.enum(["clob", "negrisk"]).describe("Trading type: CLOB or NegRisk"),
});

type GetTradingAllowanceParams = z.infer<typeof getTradingAllowanceParams>;

export const getTradingAllowanceTool = {
	name: "GET_TRADING_ALLOWANCE",
	description:
		"Check USDC allowance for CLOB or NegRisk trading contracts. Requires authentication.",
	parameters: getTradingAllowanceParams,
	execute: async (params: GetTradingAllowanceParams) => {
		try {
			const service = new GetTradingAllowanceService();
			const response = await service.execute(params.type);

			return service.format(response);
		} catch (error) {
			if (error instanceof Error) {
				console.log(`Error in GET_TRADING_ALLOWANCE tool: ${error.message}`);
				return `Error getting trading allowance: ${error.message}`;
			}
			return "An unknown error occurred while fetching trading allowance";
		}
	},
} as const;
