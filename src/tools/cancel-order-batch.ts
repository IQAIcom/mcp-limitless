import { z } from "zod";
import { CancelOrderBatchService } from "../services/cancel-order-batch.js";

const cancelOrderBatchParams = z.object({
	orderIds: z
		.array(z.string())
		.describe("Array of order IDs to be cancelled in a single batch operation"),
	apiKey: z
		.string()
		.optional()
		.describe(
			"API key or bearer token for authentication (required for trading)",
		),
});

type CancelOrderBatchParams = z.infer<typeof cancelOrderBatchParams>;

export const cancelOrderBatchTool = {
	name: "CANCEL_ORDER_BATCH",
	description:
		"Cancel multiple orders in a single batch operation on Limitless. All orders must be from the same market. Requires authentication and order ownership.",
	parameters: cancelOrderBatchParams,
	execute: async (params: CancelOrderBatchParams) => {
		try {
			const service = new CancelOrderBatchService();
			const response = await service.execute(params.orderIds, params.apiKey);

			return service.format(response);
		} catch (error) {
			if (error instanceof Error) {
				console.log(`Error in CANCEL_ORDER_BATCH tool: ${error.message}`);
				return `Error canceling orders in batch: ${error.message}`;
			}
			return "An unknown error occurred while canceling orders in batch";
		}
	},
} as const;
