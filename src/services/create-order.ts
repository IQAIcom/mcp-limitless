import dedent from "dedent";
import { client } from "../lib/client.js";

interface Order {
	salt: number;
	maker: string;
	signer: string;
	taker: string;
	tokenId: string;
	makerAmount: number;
	takerAmount: number;
	expiration: string;
	nonce: number;
	price: number;
	feeRateBps: number;
	side: string;
	signatureType: number;
	signature: string;
}

interface CreateOrderParams {
	order: Order;
	ownerId: number;
	orderType: "FOK" | "GTC";
	marketSlug: string;
}

interface MakerMatch {
	// Define maker match properties if needed
	[key: string]: any;
}

interface CreateOrderResponse {
	order: Order;
	makerMatches?: MakerMatch[];
}

export class CreateOrderService {
	async execute(
		params: CreateOrderParams,
		apiKey?: string,
	): Promise<CreateOrderResponse> {
		try {
			const headers: Record<string, string> = {};
			if (apiKey) {
				headers.Authorization = `Bearer ${apiKey}`;
			}

			const response = await client.request<CreateOrderResponse>("/orders", {
				method: "POST",
				headers,
				body: params,
			});

			if (!response) {
				throw new Error("Unable to create order");
			}

			return response;
		} catch (error: any) {
			if (error.message.includes("401")) {
				throw new Error(
					"Unauthorized. This tool requires authentication with a valid API key or session token.",
				);
			}
			if (error.message.includes("400")) {
				throw new Error(
					`Invalid order data: ${error.message}. Check balance, allowance, or market deadline.`,
				);
			}
			throw new Error(`Failed to create order: ${error.message}`);
		}
	}

	format(response: CreateOrderResponse): string {
		const orderSide = response.order.side === "BUY" ? "BUY" : "SELL";
		const matched = response.makerMatches && response.makerMatches.length > 0;

		let message = dedent`
			✅ Order Created Successfully

			📝 Order Details:
			- Side: ${orderSide}
			- Price: ${response.order.price.toFixed(4)}
			- Maker Amount: ${response.order.makerAmount}
			- Taker Amount: ${response.order.takerAmount}
			- Expiration: ${response.order.expiration}
		`;

		if (matched) {
			message += dedent`

				🎯 Order was matched immediately
				- Matches: ${response.makerMatches?.length || 0}
			`;
		}

		return message;
	}
}
