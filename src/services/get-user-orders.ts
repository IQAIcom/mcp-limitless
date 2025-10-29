import dedent from "dedent";
import { client } from "../lib/client.js";

interface Order {
	id: string;
	side: string;
	price: string;
	quantity: string;
	status: string;
	[key: string]: any;
}

interface UserOrdersResponse {
	orders: Order[];
}

export class GetUserOrdersService {
	async execute(slug: string): Promise<UserOrdersResponse> {
		try {
			const response = await client.request<UserOrdersResponse>(
				`/markets/${slug}/user-orders`,
			);

			if (!response) {
				throw new Error("Unable to retrieve user orders");
			}

			return response;
		} catch (error: any) {
			if (error.message.includes("401")) {
				throw new Error("Unauthorized. This tool requires authentication.");
			}
			throw new Error(`Failed to get user orders: ${error.message}`);
		}
	}

	format(response: UserOrdersResponse, slug: string): string {
		if (!response.orders || response.orders.length === 0) {
			return `No orders found for market: ${slug}`;
		}

		const formattedOrders = response.orders.map((order: Order) => {
			return dedent`
				📝 Order ${order.id}
				- Side: ${order.side}
				- Price: ${order.price}
				- Quantity: ${order.quantity}
				- Status: ${order.status}
			`;
		});

		return dedent`
			📋 Your Orders for ${slug}

			${formattedOrders.join("\n\n")}

			📊 Total Orders: ${response.orders.length}
		`;
	}
}
