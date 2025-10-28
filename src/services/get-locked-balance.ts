import dedent from "dedent";
import { client } from "../lib/client.js";

interface LockedBalanceResponse {
	lockedBalance: string;
	lockedBalanceFormatted: string;
	currency: string;
	orderCount: number;
}

export class GetLockedBalanceService {
	async execute(slug: string, apiKey?: string): Promise<LockedBalanceResponse> {
		try {
			const headers: Record<string, string> = {};
			if (apiKey) {
				headers.Authorization = `Bearer ${apiKey}`;
			}

			const response = await client.request<LockedBalanceResponse>(
				`/markets/${slug}/locked-balance`,
				{ headers },
			);

			if (!response) {
				throw new Error("Unable to retrieve locked balance");
			}

			return response;
		} catch (error: any) {
			if (error.message.includes("401")) {
				throw new Error("Unauthorized. This tool requires authentication.");
			}
			throw new Error(`Failed to get locked balance: ${error.message}`);
		}
	}

	format(response: LockedBalanceResponse, slug: string): string {
		return dedent`
			🔒 Locked Balance for ${slug}

			- Locked Amount: ${response.lockedBalanceFormatted}
			- Open Orders: ${response.orderCount}
		`;
	}
}
