import { client } from "../lib/client.js";

interface CancelAllOrdersResponse {
	message: string;
}

export class CancelAllOrdersService {
	async execute(slug: string): Promise<CancelAllOrdersResponse> {
		try {
			const response = await client.request<CancelAllOrdersResponse>(
				`/orders/all/${slug}`,
				{
					method: "DELETE",
				},
			);

			if (!response) {
				throw new Error("Unable to cancel all orders");
			}

			return response;
		} catch (error: any) {
			if (error.message.includes("401")) {
				throw new Error(
					"Unauthorized. You must be authenticated to cancel orders.",
				);
			}
			if (error.message.includes("400")) {
				throw new Error(`Invalid market slug: ${error.message}`);
			}
			throw new Error(`Failed to cancel all orders: ${error.message}`);
		}
	}

	format(response: CancelAllOrdersResponse, slug: string): string {
		return `✅ ${response.message} in market: ${slug}`;
	}
}
