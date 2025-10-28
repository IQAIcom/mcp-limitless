import { z } from "zod";
import { AuthLogoutService } from "../services/auth-logout.js";

const authLogoutParams = z.object({
	apiKey: z
		.string()
		.optional()
		.describe("API key or bearer token for authentication"),
});

type AuthLogoutParams = z.infer<typeof authLogoutParams>;

export const authLogoutTool = {
	name: "LOGOUT",
	description:
		"Log out the user by clearing the session cookie. Requires authentication.",
	parameters: authLogoutParams,
	execute: async (params: AuthLogoutParams) => {
		try {
			const service = new AuthLogoutService();
			const response = await service.execute(params.apiKey);

			return service.format(response);
		} catch (error) {
			if (error instanceof Error) {
				console.log(`Error in LOGOUT tool: ${error.message}`);
				return `Error logging out: ${error.message}`;
			}
			return "An unknown error occurred while logging out";
		}
	},
} as const;
