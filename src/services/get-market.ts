import dedent from "dedent";
import { client } from "../lib/client.js";

interface MarketResponse {
	question: string;
	slug: string;
	address: string;
	category?: string;
	description?: string;
	endDate?: string;
	volume?: string;
	liquidity?: string;
	outcomes?: Array<{ name: string; price: string }>;
	marketType?: string;
	status?: string;
}

export class GetMarketService {
	async execute(addressOrSlug: string): Promise<MarketResponse> {
		try {
			const response = await client.request<MarketResponse>(
				`/markets/${addressOrSlug}`,
			);

			if (!response) {
				throw new Error("Market not found");
			}

			return response;
		} catch (error: any) {
			throw new Error(`Failed to get market: ${error.message}`);
		}
	}

	format(market: MarketResponse): string {
		const formattedMarket = dedent`
			🎯 Market Details
			- Question: ${market.question}
			- Slug: ${market.slug}
			- Address: ${market.address}
			${market.category ? `- Category: ${market.category}` : ""}
			${market.description ? `- Description: ${market.description}` : ""}
			${market.marketType ? `- Type: ${market.marketType}` : ""}
			${market.status ? `- Status: ${market.status}` : ""}
			${market.volume ? `- Volume: $${market.volume}` : ""}
			${market.liquidity ? `- Liquidity: $${market.liquidity}` : ""}
			${market.endDate ? `- End Date: ${new Date(market.endDate).toLocaleString()}` : ""}
			${market.outcomes && market.outcomes.length > 0 ? `\n📊 Outcomes:\n${market.outcomes.map((o) => `- ${o.name}: ${o.price}`).join("\n")}` : ""}

			🔗 View Market: https://limitless.exchange/markets/${market.slug}
		`;

		return formattedMarket;
	}
}
