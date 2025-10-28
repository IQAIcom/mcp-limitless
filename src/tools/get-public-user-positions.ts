import { z } from "zod";
import { GetPublicUserPositionsService } from "../services/get-public-user-positions.js";

const getPublicUserPositionsParams = z.object({
	account: z
		.string()
		.regex(/^0x[a-fA-F0-9]{40}$/)
		.describe("User Ethereum address"),
});

type GetPublicUserPositionsParams = z.infer<
	typeof getPublicUserPositionsParams
>;

export const getPublicUserPositionsTool = {
	name: "GET_PUBLIC_USER_POSITIONS",
	description:
		"Get all positions for a specific user address. This is a public endpoint that doesn't require authentication.",
	parameters: getPublicUserPositionsParams,
	execute: async (params: GetPublicUserPositionsParams) => {
		try {
			const service = new GetPublicUserPositionsService();
			const response = await service.execute(params.account);

			return service.format(response, params.account);
		} catch (error) {
			if (error instanceof Error) {
				console.log(
					`Error in GET_PUBLIC_USER_POSITIONS tool: ${error.message}`,
				);
				return `Error getting public user positions: ${error.message}`;
			}
			return "An unknown error occurred while fetching public user positions";
		}
	},
} as const;
