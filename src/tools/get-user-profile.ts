import { z } from "zod";
import { GetUserProfileService } from "../services/get-user-profile.js";

const getUserProfileParams = z.object({
	address: z
		.string()
		.regex(/^0x[a-fA-F0-9]{40}$/, "Must be a valid Ethereum address")
		.describe("The Ethereum address of the user whose profile to retrieve"),
});

type GetUserProfileParams = z.infer<typeof getUserProfileParams>;

export const getUserProfileTool = {
	name: "GET_USER_PROFILE",
	description:
		"Get detailed profile information for a user by their Ethereum address. " +
		"Returns comprehensive user data including username, bio, profile picture, rank, points, " +
		"leaderboard position, referral information, and account status. " +
		"Requires authentication. Users can view their own profile when authenticated.",
	parameters: getUserProfileParams,
	execute: async (params: GetUserProfileParams) => {
		try {
			const service = new GetUserProfileService();
			const profile = await service.execute(params.address);
			return service.format(profile);
		} catch (error) {
			if (error instanceof Error) {
				console.log(`Error in GET_USER_PROFILE tool: ${error.message}`);
				return `Error retrieving user profile: ${error.message}`;
			}
			return "An unknown error occurred while fetching user profile";
		}
	},
} as const;
