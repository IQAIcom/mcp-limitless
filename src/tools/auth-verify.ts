import { z } from "zod";
import { AuthVerifyService } from "../services/auth-verify.js";

const authVerifyParams = z.object({});

type AuthVerifyParams = z.infer<typeof authVerifyParams>;

export const authVerifyTool = {
	name: "VERIFY_AUTH",
	description:
		"Verify if the user is authenticated by checking the session cookie. Returns the authenticated Ethereum address.",
	parameters: authVerifyParams,
	execute: async (params: AuthVerifyParams) => {
		try {
			const service = new AuthVerifyService();
			const address = await service.execute();

			return service.format(address);
		} catch (error) {
			if (error instanceof Error) {
				console.log(`Error in VERIFY_AUTH tool: ${error.message}`);
				return `Error verifying authentication: ${error.message}`;
			}
			return "An unknown error occurred while verifying authentication";
		}
	},
} as const;
