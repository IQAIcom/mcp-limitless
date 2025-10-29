import { z } from "zod";
import { client } from "../lib/client.js";

// No parameters needed for auth status
const getAuthStatusParams = z.object({});

type GetAuthStatusParams = z.infer<typeof getAuthStatusParams>;

export const getAuthStatusTool = {
	name: "GET_AUTH_STATUS",
	description:
		"Check the current authentication status for the Limitless API session. Returns whether you're logged in and your Ethereum address. Session persists automatically across all tool calls.",
	parameters: getAuthStatusParams,
	execute: async (_params: GetAuthStatusParams) => {
		try {
			// Verify session and get address (automatically clears invalid sessions)
			const address = await client.verifySession();

			if (!address) {
				return `🔒 Not Authenticated

You are not currently logged in to Limitless Exchange.

To authenticate:
1. Call GET_SIGNING_MESSAGE with your Ethereum address
2. Sign the message with your wallet
3. Call LOGIN with the signature

Once authenticated, your session will persist automatically across all tool calls until you LOGOUT.`;
			}

			return `✅ Authenticated

Session Status: Active
Ethereum Address: ${address}

Your session is active and will persist across all tool calls. You can now:
- View your portfolio positions
- Place and cancel orders
- Access all authenticated endpoints

To end your session, call the LOGOUT tool.`;
		} catch (error) {
			if (error instanceof Error) {
				console.log(`Error in GET_AUTH_STATUS tool: ${error.message}`);
				return `❌ Error checking authentication status: ${error.message}`;
			}
			return "❌ An unknown error occurred while checking authentication status";
		}
	},
} as const;
