import dedent from "dedent";
import { client } from "../lib/client.js";

interface Market {
	title: string;
	slug: string;
	category?: string;
	volume?: string;
	liquidity?: string;
	endDate?: string;
}

interface SearchMarketsResponse {
	markets: Market[];
	total: number;
	page: number;
	limit: number;
}

// API returns only {markets: Market[]}
interface SearchMarketsAPIResponse {
	markets: Market[];
}

export class SearchMarketsService {
	async execute(
		query: string,
		limit = 10,
		page = 1,
		similarityThreshold = 0.5,
	): Promise<SearchMarketsResponse> {
		try {
			const params = new URLSearchParams({
				query,
				limit: limit.toString(),
				page: page.toString(),
				similarityThreshold: similarityThreshold.toString(),
			});

			const response = await client.request<SearchMarketsAPIResponse>(
				`/markets/search?${params.toString()}`,
			);

			// API doesn't return pagination fields, so we add them
			return {
				markets: response.markets || [],
				total: response.markets?.length || 0,
				page: page,
				limit: limit,
			};
		} catch (error: any) {
			throw new Error(`Failed to search markets: ${error.message}`);
		}
	}

	format(response: SearchMarketsResponse): string {
		if (!response.markets || response.markets.length === 0) {
			return "No markets found for the given query.";
		}

		const formattedMarkets = response.markets.map((market: Market) => {
			return dedent`
                🎯 ${market.title}
                - Slug: ${market.slug}
                ${market.category ? `- Category: ${market.category}` : ""}
                ${market.volume ? `- Volume: $${market.volume}` : ""}
                ${market.liquidity ? `- Liquidity: $${market.liquidity}` : ""}
                ${market.endDate ? `- End Date: ${new Date(market.endDate).toLocaleString()}` : ""}
                - URL: https://limitless.exchange/markets/${market.slug}
            `;
		});

		return dedent`
            🔍 Found ${response.total} markets (showing page ${response.page})

            ${formattedMarkets.join("\n\n")}
        `;
	}
}
