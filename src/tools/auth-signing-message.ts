import { z } from "zod";
import { AuthSigningMessageService } from "../services/auth-signing-message.js";

const authSigningMessageParams = z.object({});

type AuthSigningMessageParams = z.infer<typeof authSigningMessageParams>;

export const authSigningMessageTool = {
	name: "GET_SIGNING_MESSAGE",
	description:
		"Get a signing message with a randomly generated nonce for authentication purposes. Use this before logging in.",
	parameters: authSigningMessageParams,
	execute: async (_params: AuthSigningMessageParams) => {
		try {
			const service = new AuthSigningMessageService();
			const message = await service.execute();

			return service.format(message);
		} catch (error) {
			if (error instanceof Error) {
				console.log(`Error in GET_SIGNING_MESSAGE tool: ${error.message}`);
				return `Error getting signing message: ${error.message}`;
			}
			return "An unknown error occurred while getting signing message";
		}
	},
} as const;
