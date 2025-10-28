import { z } from "zod";
import { CancelAllOrdersService } from "../services/cancel-all-orders.js";

const cancelAllOrdersParams = z.object({
	slug: z.string().describe("Market slug to cancel all user orders in"),
	apiKey: z
		.string()
		.optional()
		.describe(
			"API key or bearer token for authentication (required for trading)",
		),
});

type CancelAllOrdersParams = z.infer<typeof cancelAllOrdersParams>;

export const cancelAllOrdersTool = {
	name: "CANCEL_ALL_ORDERS",
	description:
		"Cancel all of a user's open orders in a specific market on Limitless. Requires authentication.",
	parameters: cancelAllOrdersParams,
	execute: async (params: CancelAllOrdersParams) => {
		try {
			const service = new CancelAllOrdersService();
			const response = await service.execute(params.slug, params.apiKey);

			return service.format(response, params.slug);
		} catch (error) {
			if (error instanceof Error) {
				console.log(`Error in CANCEL_ALL_ORDERS tool: ${error.message}`);
				return `Error canceling all orders: ${error.message}`;
			}
			return "An unknown error occurred while canceling all orders";
		}
	},
} as const;
