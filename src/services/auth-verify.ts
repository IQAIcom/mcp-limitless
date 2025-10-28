import { client } from "../lib/client.js";

export class AuthVerifyService {
	async execute(apiKey?: string): Promise<string> {
		try {
			const headers: Record<string, string> = {};
			if (apiKey) {
				headers.Authorization = `Bearer ${apiKey}`;
			}

			const response = await client.request<string>("/auth/verify-auth", {
				headers,
			});

			if (!response) {
				throw new Error("Unable to verify authentication");
			}

			return response;
		} catch (error: any) {
			if (error.message.includes("401")) {
				throw new Error("Not authenticated. Please login first.");
			}
			throw new Error(`Failed to verify authentication: ${error.message}`);
		}
	}

	format(address: string): string {
		return `✅ Authenticated as: ${address}`;
	}
}
