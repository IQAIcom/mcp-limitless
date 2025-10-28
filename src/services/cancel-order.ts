import { client } from "../lib/client.js";

interface CancelOrderResponse {
	message: string;
}

export class CancelOrderService {
	async execute(
		orderId: string,
		apiKey?: string,
	): Promise<CancelOrderResponse> {
		try {
			const headers: Record<string, string> = {};
			if (apiKey) {
				headers.Authorization = `Bearer ${apiKey}`;
			}

			const response = await client.request<CancelOrderResponse>(
				`/orders/${orderId}`,
				{
					method: "DELETE",
					headers,
				},
			);

			if (!response) {
				throw new Error("Unable to cancel order");
			}

			return response;
		} catch (error: any) {
			if (error.message.includes("401")) {
				throw new Error(
					"Unauthorized. You must be authenticated and own this order.",
				);
			}
			if (error.message.includes("400")) {
				throw new Error(`Order cannot be cancelled: ${error.message}`);
			}
			throw new Error(`Failed to cancel order: ${error.message}`);
		}
	}

	format(response: CancelOrderResponse): string {
		return `✅ ${response.message}`;
	}
}
