import { client } from "../lib/client.js";

interface LogoutResponse {
	message: string;
}

export class AuthLogoutService {
	async execute(apiKey?: string): Promise<LogoutResponse> {
		try {
			// If apiKey provided, use it for backward compatibility
			const headers: Record<string, string> = {};
			if (apiKey) {
				headers.Authorization = `Bearer ${apiKey}`;
			}

			// Call logout endpoint
			const response = await client.request<LogoutResponse>("/auth/logout", {
				method: "POST",
				headers,
				body: {}, // Empty body required by API
			});

			// Clear local session cookies after successful logout
			await client.clearSession();

			if (!response) {
				throw new Error("Unable to logout");
			}

			return response;
		} catch (error: any) {
			// Still clear session even if API call fails (best effort)
			try {
				await client.clearSession();
			} catch (clearError) {
				console.error("Error clearing session:", clearError);
			}

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
