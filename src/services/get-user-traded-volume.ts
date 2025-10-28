import dedent from "dedent";
import { client } from "../lib/client.js";

interface TradedVolumeResponse {
	totalVolume?: number;
	tradeCount?: number;
	[key: string]: any;
}

export class GetUserTradedVolumeService {
	async execute(account: string): Promise<TradedVolumeResponse> {
		try {
			const response = await client.request<TradedVolumeResponse>(
				`/portfolio/${account}/traded-volume`,
			);

			if (!response) {
				throw new Error("Unable to retrieve traded volume");
			}

			return response;
		} catch (error: any) {
			throw new Error(`Failed to get user traded volume: ${error.message}`);
		}
	}

	format(response: TradedVolumeResponse, account: string): string {
		let output = `📊 Trading Volume for ${account}\n\n`;

		if (response.totalVolume !== undefined) {
			output += `Total Volume: $${response.totalVolume.toLocaleString()}\n`;
		}

		if (response.tradeCount !== undefined) {
			output += `Trade Count: ${response.tradeCount}\n`;
		}

		// If response has other fields, show them
		const otherFields = Object.entries(response).filter(
			([key]) => key !== "totalVolume" && key !== "tradeCount",
		);

		if (otherFields.length > 0) {
			output += "\nAdditional Stats:\n";
			for (const [key, value] of otherFields) {
				output += `- ${key}: ${value}\n`;
			}
		}

		return output;
	}
}
