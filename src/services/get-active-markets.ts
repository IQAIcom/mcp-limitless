import dedent from "dedent";
import { client } from "../lib/client.js";

interface Market {
	question?: string;
	title?: string; // API returns title, map to question
	slug: string;
	category?: string;
	volume?: string;
	liquidity?: string;
	endDate?: string;
}

interface ActiveMarketsResponse {
	markets: Market[];
	total: number;
	page: number;
	limit: number;
}

export class GetActiveMarketsService {
	async execute(
		categoryId?: number,
		page = 1,
		limit = 10,
		sortBy = "newest",
	): Promise<ActiveMarketsResponse> {
		try {
			const params = new URLSearchParams({
				page: page.toString(),
				limit: limit.toString(),
				sortBy,
			});

			const endpoint = categoryId
				? `/markets/active/${categoryId}?${params.toString()}`
				: `/markets/active?${params.toString()}`;

			// API returns {data: Market[], totalMarketsCount: number}
			const response = await client.request<{
				data: Market[];
				totalMarketsCount: number;
			}>(endpoint);

			// Transform to expected format and map title to question for backward compatibility
			const markets = response.data.map((market) => ({
				...market,
				question: market.question || market.title,
			}));

			return {
				markets,
				total: response.totalMarketsCount,
				page: page,
				limit: limit,
			};
		} catch (error: any) {
			throw new Error(`Failed to get active markets: ${error.message}`);
		}
	}

	format(response: ActiveMarketsResponse): string {
		if (!response.markets || response.markets.length === 0) {
			return "No active markets found.";
		}

		const formattedMarkets = response.markets.map((market: Market) => {
			return dedent`
                🎯 ${market.question}
                - Slug: ${market.slug}
                ${market.category ? `- Category: ${market.category}` : ""}
                ${market.volume ? `- Volume: $${market.volume}` : ""}
                ${market.liquidity ? `- Liquidity: $${market.liquidity}` : ""}
                ${market.endDate ? `- End Date: ${new Date(market.endDate).toLocaleString()}` : ""}
                - URL: https://limitless.exchange/markets/${market.slug}
            `;
		});

		return dedent`
            📊 Active Markets (${response.total} total, showing page ${response.page})

            ${formattedMarkets.join("\n\n")}
        `;
	}
}
