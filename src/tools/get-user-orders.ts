import { z } from "zod";
import { GetUserOrdersService } from "../services/get-user-orders.js";

const getUserOrdersParams = z.object({
	slug: z.string().describe("Market slug identifier"),
});

type GetUserOrdersParams = z.infer<typeof getUserOrdersParams>;

export const getUserOrdersTool = {
	name: "GET_USER_ORDERS",
	description:
		"Get all orders placed by the authenticated user for a specific market. Requires authentication.",
	parameters: getUserOrdersParams,
	execute: async (params: GetUserOrdersParams) => {
		try {
			const service = new GetUserOrdersService();
			const response = await service.execute(params.slug);

			return service.format(response, params.slug);
		} catch (error) {
			if (error instanceof Error) {
				console.log(`Error in GET_USER_ORDERS tool: ${error.message}`);
				return `Error getting user orders: ${error.message}`;
			}
			return "An unknown error occurred while fetching user orders";
		}
	},
} as const;
