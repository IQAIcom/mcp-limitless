import dedent from "dedent";
import { client } from "../lib/client.js";

interface GetActiveMarketsByCategoryParams {
	categoryId: number;
	page?: number;
	limit?: number;
	sortBy?: string;
}

interface Market {
	id: string;
	slug: string;
	title: string;
	volume?: number;
	liquidity?: number;
	[key: string]: any;
}

interface BrowseActiveMarketsResponse {
	markets: Market[];
	total: number;
	page: number;
	limit: number;
}

export class GetActiveMarketsByCategoryService {
	async execute(
		params: GetActiveMarketsByCategoryParams,
	): Promise<BrowseActiveMarketsResponse> {
		try {
			const queryParams = new URLSearchParams();
			if (params.page) queryParams.append("page", params.page.toString());
			if (params.limit) queryParams.append("limit", params.limit.toString());
			if (params.sortBy) queryParams.append("sortBy", params.sortBy);

			const endpoint = `/markets/active/${params.categoryId}${
				queryParams.toString() ? `?${queryParams.toString()}` : ""
			}`;

			const response =
				await client.request<BrowseActiveMarketsResponse>(endpoint);

			if (!response) {
				throw new Error("Unable to retrieve active markets by category");
			}

			return response;
		} catch (error: any) {
			throw new Error(
				`Failed to get active markets by category: ${error.message}`,
			);
		}
	}

	format(response: BrowseActiveMarketsResponse, categoryId: number): string {
		if (!response.markets || response.markets.length === 0) {
			return `No active markets found in category ${categoryId}.`;
		}

		const formattedMarkets = response.markets
			.slice(0, 10)
			.map((market: Market) => {
				return dedent`
				📊 ${market.title}
				- Slug: ${market.slug}
				${market.volume ? `- Volume: $${market.volume.toFixed(2)}` : ""}
				${market.liquidity ? `- Liquidity: $${market.liquidity.toFixed(2)}` : ""}
			`;
			});

		return dedent`
			📈 Active Markets in Category ${categoryId}

			${formattedMarkets.join("\n\n")}

			📊 Summary:
			- Total Markets: ${response.total}
			- Page: ${response.page}
			- Showing: ${response.markets.length} markets
		`;
	}
}
