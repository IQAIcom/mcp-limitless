import dedent from "dedent";
import { client } from "../lib/client.js";

interface MarketResponse {
	question: string;
	slug: string;
	address?: string;
	category?: string;
	description?: string;
	endDate?: string;
	volume?: string;
	liquidity?: string;
	outcomes?: Array<{ name: string; price: string }>;
	marketType?: string;
	status?: string;
}

// API returns different field names
interface MarketAPIResponse {
	title: string;
	slug: string;
	address?: string | null;
	categories?: string[];
	description?: string;
	expirationDate?: string;
	volume?: string;
	volumeFormatted?: string;
	liquidity?: string;
	liquidityFormatted?: string;
	marketType?: string;
	status?: string;
}

export class GetMarketService {
	async execute(addressOrSlug: string): Promise<MarketResponse> {
		try {
			const response = await client.request<MarketAPIResponse>(
				`/markets/${addressOrSlug}`,
			);

			if (!response) {
				throw new Error("Market not found");
			}

			// Map API response to our interface
			return {
				question: response.title,
				slug: response.slug,
				address: response.address || undefined,
				category: response.categories?.[0],
				description: response.description,
				endDate: response.expirationDate,
				volume: response.volumeFormatted || response.volume,
				liquidity: response.liquidityFormatted || response.liquidity,
				marketType: response.marketType,
				status: response.status,
			};
		} catch (error: any) {
			throw new Error(`Failed to get market: ${error.message}`);
		}
	}

	format(market: MarketResponse): string {
		const formattedMarket = dedent`
			🎯 Market Details
			- Question: ${market.question}
			- Slug: ${market.slug}
			${market.address ? `- Address: ${market.address}` : ""}
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
