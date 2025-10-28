import dedent from "dedent";
import { client } from "../lib/client.js";

interface Trade {
	id: string;
	market: string;
	side: string;
	price: number;
	quantity: number;
	timestamp: string;
	[key: string]: any;
}

interface TradesResponse {
	trades?: Trade[];
	[key: string]: any;
}

export class GetPortfolioTradesService {
	async execute(apiKey?: string): Promise<TradesResponse> {
		try {
			const headers: Record<string, string> = {};
			if (apiKey) {
				headers.Authorization = `Bearer ${apiKey}`;
			}

			const response = await client.request<TradesResponse>(
				"/portfolio/trades",
				{ headers },
			);

			if (!response) {
				throw new Error("Unable to retrieve trades");
			}

			return response;
		} catch (error: any) {
			if (error.message.includes("401")) {
				throw new Error("Unauthorized. This tool requires authentication.");
			}
			throw new Error(`Failed to get portfolio trades: ${error.message}`);
		}
	}

	format(response: TradesResponse): string {
		if (!response.trades || response.trades.length === 0) {
			return "No trades found in your portfolio.";
		}

		const formattedTrades = response.trades.slice(0, 10).map((trade: Trade) => {
			const timestamp = new Date(trade.timestamp).toLocaleString();
			return dedent`
				🔄 ${trade.market}
				- Side: ${trade.side}
				- Price: ${trade.price.toFixed(4)}
				- Quantity: ${trade.quantity}
				- Time: ${timestamp}
			`;
		});

		const hasMore = response.trades.length > 10;

		return dedent`
			💼 Your Trading History

			${formattedTrades.join("\n\n")}
			${hasMore ? `\n...and ${response.trades.length - 10} more trades` : ""}

			📊 Total Trades: ${response.trades.length}
		`;
	}
}
