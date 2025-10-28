import { z } from "zod";
import { CancelOrderService } from "../services/cancel-order.js";

const cancelOrderParams = z.object({
	orderId: z
		.string()
		.describe("Unique identifier of the order to be cancelled"),
	apiKey: z
		.string()
		.optional()
		.describe(
			"API key or bearer token for authentication (required for trading)",
		),
});

type CancelOrderParams = z.infer<typeof cancelOrderParams>;

export const cancelOrderTool = {
	name: "CANCEL_ORDER",
	description:
		"Cancel an open order on Limitless and return locked funds. Requires authentication and order ownership.",
	parameters: cancelOrderParams,
	execute: async (params: CancelOrderParams) => {
		try {
			const service = new CancelOrderService();
			const response = await service.execute(params.orderId, params.apiKey);

			return service.format(response);
		} catch (error) {
			if (error instanceof Error) {
				console.log(`Error in CANCEL_ORDER tool: ${error.message}`);
				return `Error canceling order: ${error.message}`;
			}
			return "An unknown error occurred while canceling the order";
		}
	},
} as const;
