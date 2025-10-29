import { client } from "../lib/client.js";

export class AuthVerifyService {
	async execute(apiKey?: string): Promise<string> {
		try {
			// If apiKey provided, use it for backward compatibility
			const headers: Record<string, string> = {};
			if (apiKey) {
				headers.Cookie = `limitless_session=${apiKey}`;
			}

			// Session cookies are automatically sent by the client
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
