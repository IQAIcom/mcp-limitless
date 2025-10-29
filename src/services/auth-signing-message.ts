export interface AuthSigningMessageResponse {
	message: string;
	nonce: string;
}

export class AuthSigningMessageService {
	async execute(address: string): Promise<AuthSigningMessageResponse> {
		try {
			// Validate address format (must be 0x followed by 40 hex characters)
			if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
				throw new Error("Invalid Ethereum address format");
			}

			// API returns plain text with message and nonce
			const response = await fetch(
				`https://api.limitless.exchange/auth/signing-message?address=${address}`,
			);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const text = await response.text();

			if (!text) {
				throw new Error("Unable to retrieve signing message");
			}

			// Parse nonce from the text (format: "Nonce: 0x...")
			const nonceMatch = text.match(/Nonce:\s*(0x[a-fA-F0-9]+)/);
			if (!nonceMatch) {
				throw new Error("Unable to parse nonce from signing message");
			}

			const nonce = nonceMatch[1];
			// Extract message (everything before the nonce line)
			const message = text.substring(0, text.indexOf("Nonce:")).trim();

			return {
				message,
				nonce,
			};
		} catch (error: any) {
			throw new Error(`Failed to get signing message: ${error.message}`);
		}
	}

	format(response: AuthSigningMessageResponse): string {
		return `📝 Signing Message:\n\nMessage: ${response.message}\n\nNonce: ${response.nonce}`;
	}
}
