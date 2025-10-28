import { client } from "../lib/client.js";

interface LogoutResponse {
	message: string;
}

export class AuthLogoutService {
	async execute(apiKey?: string): Promise<LogoutResponse> {
		try {
			const headers: Record<string, string> = {};
			if (apiKey) {
				headers.Authorization = `Bearer ${apiKey}`;
			}

			const response = await client.request<LogoutResponse>("/auth/logout", {
				method: "POST",
				headers,
			});

			if (!response) {
				throw new Error("Unable to logout");
			}

			return response;
		} catch (error: any) {
			if (error.message.includes("401")) {
				throw new Error("Not authenticated.");
			}
			throw new Error(`Failed to logout: ${error.message}`);
		}
	}

	format(response: LogoutResponse): string {
		return `✅ ${response.message}`;
	}
}
