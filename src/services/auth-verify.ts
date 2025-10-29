import { client } from "../lib/client.js";

export class AuthVerifyService {
	async execute(): Promise<string> {
		try {
			// Session cookies are automatically sent by the client
			const response = await client.request<string>("/auth/verify-auth");

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
