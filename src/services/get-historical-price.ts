import dedent from "dedent";
import { client } from "../lib/client.js";

interface GetHistoricalPriceParams {
	slug: string;
	from?: string;
	to?: string;
	interval?: "1h" | "6h" | "1d" | "1w" | "1m" | "all";
}

interface PricePoint {
	timestamp: string;
	price: number;
}

export class GetHistoricalPriceService {
	async execute(params: GetHistoricalPriceParams): Promise<PricePoint[]> {
		try {
			const queryParams = new URLSearchParams();
			if (params.from) queryParams.append("from", params.from);
			if (params.to) queryParams.append("to", params.to);
			if (params.interval) queryParams.append("interval", params.interval);

			const endpoint = `/markets/${params.slug}/historical-price${
				queryParams.toString() ? `?${queryParams.toString()}` : ""
			}`;

			// API returns {title: string, prices: PricePoint[]}
			const response = await client.request<{
				title: string;
				prices: PricePoint[];
			}>(endpoint);

			if (!response || !response.prices) {
				throw new Error("Unable to retrieve historical prices");
			}

			// Return just the prices array
			return response.prices;
		} catch (error: any) {
			throw new Error(`Failed to get historical prices: ${error.message}`);
		}
	}

	format(prices: PricePoint[], slug: string): string {
		if (!prices || prices.length === 0) {
			return `No historical price data found for market: ${slug}`;
		}

		const formattedPrices = prices.slice(0, 10).map((point: PricePoint) => {
			const timestamp = new Date(Number.parseInt(point.timestamp)).toLocaleString();
			return `- ${timestamp}: ${(point.price * 100).toFixed(2)}¢`;
		});

		const hasMore = prices.length > 10;
		const latestPrice = prices[prices.length - 1];
		const oldestPrice = prices[0];
		const priceChange = latestPrice.price - oldestPrice.price;
		const changePercent = (priceChange / oldestPrice.price) * 100;

		return dedent`
			📈 Historical Prices for ${slug}

			${formattedPrices.join("\n")}
			${hasMore ? `...and ${prices.length - 10} more data points` : ""}

			📊 Summary:
			- Data Points: ${prices.length}
			- Price Change: ${priceChange >= 0 ? "+" : ""}${(priceChange * 100).toFixed(2)}¢ (${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%)
			- Latest: ${(latestPrice.price * 100).toFixed(2)}¢
		`;
	}
}
