import { client } from "../lib/client.js";

interface LoginParams {
	account: string;
	signingMessage: string;
	signature: string;
	userData: {
		client: string;
		[key: string]: any;
	};
}

interface LoginResponse {
	account: string;
	token?: string;
	[key: string]: any;
}

export class AuthLoginService {
	async execute(params: LoginParams): Promise<LoginResponse> {
		try {
			// Encode signing message as hex to handle newlines in HTTP header
			const signingMessageHex = `0x${Buffer.from(params.signingMessage).toString("hex")}`;

			const headers: Record<string, string> = {
				"x-account": params.account,
				"x-signing-message": signingMessageHex,
				"x-signature": params.signature,
			};

			const response = await client.request<LoginResponse>("/auth/login", {
				method: "POST",
				headers,
				body: params.userData,
			});

			if (!response) {
				throw new Error("Unable to login");
			}

			return response;
		} catch (error: any) {
			if (error.message.includes("401") || error.message.includes("400")) {
				throw new Error(
					`Authentication failed: ${error.message}. Check your signature and account.`,
				);
			}
			throw new Error(`Failed to login: ${error.message}`);
		}
	}

	format(response: LoginResponse): string {
		return `✅ Login Successful!\n\nAccount: ${response.account}`;
	}
}
