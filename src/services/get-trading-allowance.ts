import dedent from "dedent";
import { client } from "../lib/client.js";

interface TradingAllowanceResponse {
	allowance: string;
	hasMinimumAllowance: boolean;
	type: "clob" | "negrisk";
	spender: string;
	checkedAddress: string;
}

export class GetTradingAllowanceService {
	async execute(
		type: "clob" | "negrisk",
		apiKey?: string,
	): Promise<TradingAllowanceResponse> {
		try {
			const headers: Record<string, string> = {};
			if (apiKey) {
				headers.Authorization = `Bearer ${apiKey}`;
			}

			const response = await client.request<TradingAllowanceResponse>(
				`/portfolio/trading/allowance?type=${type}`,
				{ headers },
			);

			if (!response) {
				throw new Error("Unable to retrieve trading allowance");
			}

			return response;
		} catch (error: any) {
			if (error.message.includes("401")) {
				throw new Error("Unauthorized. This tool requires authentication.");
			}
			throw new Error(`Failed to get trading allowance: ${error.message}`);
		}
	}

	format(response: TradingAllowanceResponse): string {
		const status = response.hasMinimumAllowance
			? "✅ Sufficient"
			: "⚠️ Insufficient";

		return dedent`
			💳 Trading Allowance (${response.type.toUpperCase()})

			Status: ${status}
			- Allowance: ${response.allowance}
			- Spender: ${response.spender}
			- Checked Address: ${response.checkedAddress}
		`;
	}
}
