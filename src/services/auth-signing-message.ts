import { client } from "../lib/client.js";

export class AuthSigningMessageService {
	async execute(): Promise<string> {
		try {
			const response = await client.request<string>("/auth/signing-message");

			if (!response) {
				throw new Error("Unable to retrieve signing message");
			}

			return response;
		} catch (error: any) {
			throw new Error(`Failed to get signing message: ${error.message}`);
		}
	}

	format(message: string): string {
		return `📝 Signing Message:\n\n${message}`;
	}
}
