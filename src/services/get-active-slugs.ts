import dedent from "dedent";
import { client } from "../lib/client.js";

interface MarketSlug {
	slug: string;
	strikePrice?: string | null;
	ticker?: string | null;
	deadline?: string | null;
	markets?: MarketSlug[];
}

export class GetActiveSlugsService {
	async execute(): Promise<MarketSlug[]> {
		try {
			const response = await client.request<MarketSlug[]>(
				"/markets/active/slugs",
			);

			if (!response) {
				throw new Error("Unable to retrieve active slugs");
			}

			return response;
		} catch (error: any) {
			throw new Error(`Failed to get active slugs: ${error.message}`);
		}
	}

	format(slugs: MarketSlug[]): string {
		if (!slugs || slugs.length === 0) {
			return "No active market slugs found.";
		}

		const formattedSlugs = slugs.slice(0, 20).map((item: MarketSlug) => {
			let result = `- ${item.slug}`;
			if (item.ticker) result += ` [${item.ticker}]`;
			if (item.strikePrice) result += ` - Strike: $${item.strikePrice}`;
			if (item.deadline)
				result += ` - Deadline: ${new Date(item.deadline).toLocaleDateString()}`;
			if (item.markets && item.markets.length > 0) {
				result += `\n  └─ ${item.markets.length} nested markets`;
			}
			return result;
		});

		const hasMore = slugs.length > 20;

		return dedent`
			📋 Active Market Slugs

			${formattedSlugs.join("\n")}
			${hasMore ? `\n...and ${slugs.length - 20} more` : ""}

			📊 Total: ${slugs.length} active markets/groups
		`;
	}
}
