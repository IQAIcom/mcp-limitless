import { z } from "zod";
import { GetUserTradedVolumeService } from "../services/get-user-traded-volume.js";

const getUserTradedVolumeParams = z.object({
	account: z
		.string()
		.regex(/^0x[a-fA-F0-9]{40}$/)
		.describe("User Ethereum address"),
});

type GetUserTradedVolumeParams = z.infer<typeof getUserTradedVolumeParams>;

export const getUserTradedVolumeTool = {
	name: "GET_USER_TRADED_VOLUME",
	description:
		"Get total traded volume and statistics for a specific user. This is a public endpoint that doesn't require authentication.",
	parameters: getUserTradedVolumeParams,
	execute: async (params: GetUserTradedVolumeParams) => {
		try {
			const service = new GetUserTradedVolumeService();
			const response = await service.execute(params.account);

			return service.format(response, params.account);
		} catch (error) {
			if (error instanceof Error) {
				console.log(`Error in GET_USER_TRADED_VOLUME tool: ${error.message}`);
				return `Error getting user traded volume: ${error.message}`;
			}
			return "An unknown error occurred while fetching user traded volume";
		}
	},
} as const;
