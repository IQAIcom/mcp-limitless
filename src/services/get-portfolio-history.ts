import dedent from "dedent";
import { client } from "../lib/client.js";

interface GetPortfolioHistoryParams {
	page: number;
	limit: number;
	from?: string;
	to?: string;
}

interface HistoryItem {
	id: string;
	type: string;
	timestamp: string;
	market?: string;
	[key: string]: any;
}

interface HistoryResponse {
	items: HistoryItem[];
	total: number;
	page: number;
	limit: number;
}

export class GetPortfolioHistoryService {
	async execute(
		params: GetPortfolioHistoryParams,
		apiKey?: string,
	): Promise<HistoryResponse> {
		try {
			const headers: Record<string, string> = {};
			if (apiKey) {
				headers.Authorization = `Bearer ${apiKey}`;
			}

			const queryParams = new URLSearchParams();
			queryParams.append("page", params.page.toString());
			queryParams.append("limit", params.limit.toString());
			if (params.from) queryParams.append("from", params.from);
			if (params.to) queryParams.append("to", params.to);

			const endpoint = `/portfolio/history?${queryParams.toString()}`;

			const response = await client.request<HistoryResponse>(endpoint, {
				headers,
			});

			if (!response) {
				throw new Error("Unable to retrieve portfolio history");
			}

			return response;
		} catch (error: any) {
			if (error.message.includes("401")) {
				throw new Error("Unauthorized. This tool requires authentication.");
			}
			throw new Error(`Failed to get portfolio history: ${error.message}`);
		}
	}

	format(response: HistoryResponse): string {
		if (!response.items || response.items.length === 0) {
			return "No history items found.";
		}

		const formattedItems = response.items.map((item: HistoryItem) => {
			const timestamp = new Date(item.timestamp).toLocaleString();
			return dedent`
				📌 ${item.type}
				${item.market ? `- Market: ${item.market}` : ""}
				- Time: ${timestamp}
			`;
		});

		return dedent`
			📜 Portfolio History

			${formattedItems.join("\n\n")}

			📊 Summary:
			- Page: ${response.page} of ${Math.ceil(response.total / response.limit)}
			- Showing: ${response.items.length} items
			- Total: ${response.total} items
		`;
	}
}
