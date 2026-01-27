import dedent from "dedent";
import { client } from "../lib/client.js";

interface Order {
	price: number;
	size: number;
}

interface OrderbookResponse {
	adjustedMidpoint: number | null;
	asks: Order[];
	bids: Order[];
	lastTradePrice: number | null;
	maxSpread: number | string; // Can be string or number
	minSize: number;
	tokenId: string;
}

export class GetMarketOrderbookService {
	async execute(slug: string): Promise<OrderbookResponse> {
		try {
			const response = await client.request<OrderbookResponse>(
				`/markets/${slug}/orderbook`,
			);

			if (!response) {
				throw new Error("Orderbook not found");
			}

			return response;
		} catch (error: any) {
			throw new Error(`Failed to get orderbook: ${error.message}`);
		}
	}

	format(orderbook: OrderbookResponse): string {
		const topAsks = orderbook.asks.slice(0, 5);
		const topBids = orderbook.bids.slice(0, 5);

		const formattedAsks =
			topAsks.length > 0
				? topAsks
						.map((ask) => `  ${ask.price.toFixed(4)} | ${ask.size}`)
						.join("\n")
				: "  No asks";

		const formattedBids =
			topBids.length > 0
				? topBids
						.map((bid) => `  ${bid.price.toFixed(4)} | ${bid.size}`)
						.join("\n")
				: "  No bids";

		// Handle maxSpread as string or number
		const maxSpread =
			typeof orderbook.maxSpread === "string"
				? Number.parseFloat(orderbook.maxSpread)
				: orderbook.maxSpread;

		const lastTradePrice =
			orderbook.lastTradePrice !== null
				? orderbook.lastTradePrice.toFixed(4)
				: "N/A";
		const adjustedMidpoint =
			orderbook.adjustedMidpoint !== null
				? orderbook.adjustedMidpoint.toFixed(4)
				: "N/A";

		const formattedOrderbook = dedent`
			📊 Market Orderbook

			Last Trade Price: ${lastTradePrice}
			Adjusted Midpoint: ${adjustedMidpoint}
			Max Spread: ${maxSpread.toFixed(4)}
			Min Size: ${orderbook.minSize}

			📈 Top Asks (Sell Orders):
			${formattedAsks}

			📉 Top Bids (Buy Orders):
			${formattedBids}

			Total Asks: ${orderbook.asks.length}
			Total Bids: ${orderbook.bids.length}
		`;

		return formattedOrderbook;
	}
}
