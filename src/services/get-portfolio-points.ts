import dedent from "dedent";
import { client } from "../lib/client.js";

interface PointsResponse {
	totalPoints?: number;
	breakdown?: {
		[key: string]: number;
	};
	[key: string]: any;
}

export class GetPortfolioPointsService {
	async execute(apiKey?: string): Promise<PointsResponse> {
		try {
			const headers: Record<string, string> = {};
			if (apiKey) {
				headers.Authorization = `Bearer ${apiKey}`;
			}

			const response = await client.request<PointsResponse>(
				"/portfolio/points",
				{ headers },
			);

			if (!response) {
				throw new Error("Unable to retrieve points breakdown");
			}

			return response;
		} catch (error: any) {
			if (error.message.includes("401")) {
				throw new Error("Unauthorized. This tool requires authentication.");
			}
			throw new Error(`Failed to get portfolio points: ${error.message}`);
		}
	}

	format(response: PointsResponse): string {
		let output = "⭐ Points Breakdown\n\n";

		if (response.totalPoints !== undefined) {
			output += `Total Points: ${response.totalPoints}\n\n`;
		}

		if (response.breakdown) {
			output += "Breakdown:\n";
			for (const [category, points] of Object.entries(response.breakdown)) {
				output += `- ${category}: ${points} points\n`;
			}
		} else {
			// If response structure is different, just show the data
			const dataStr = JSON.stringify(response, null, 2);
			output += dataStr;
		}

		return output;
	}
}
