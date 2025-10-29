import { client } from "../lib/client.js";

interface CancelOrderBatchResponse {
	message: string;
}

export class CancelOrderBatchService {
	async execute(orderIds: string[]): Promise<CancelOrderBatchResponse> {
		try {
			const response = await client.request<CancelOrderBatchResponse>(
				"/orders/cancel-batch",
				{
					method: "POST",
					body: { orderIds },
				},
			);

			if (!response) {
				throw new Error("Unable to cancel orders");
			}

			return response;
		} catch (error: any) {
			if (error.message.includes("401")) {
				throw new Error(
					"Unauthorized. You must be authenticated and own all orders.",
				);
			}
			if (error.message.includes("400")) {
				throw new Error(
					`Invalid request: ${error.message}. Orders may be from different markets.`,
				);
			}
			throw new Error(`Failed to cancel orders in batch: ${error.message}`);
		}
	}

	format(response: CancelOrderBatchResponse): string {
		return `✅ ${response.message}`;
	}
}
