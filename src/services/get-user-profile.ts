import { client } from "../lib/client.js";

export interface UserProfile {
	id: number;
	account: string;
	username: string;
	displayName: string;
	bio?: string;
	client: string;
	pfpUrl?: string;
	smartWallet?: string | null;
	isCreator: boolean;
	isOnboarded: boolean;
	isAdmin: boolean;
	socialUrl?: string | null;
	hasTraded: boolean;
	referralCode: string;
	mode: string;
	tradeWalletOption?: string | null;
	tradeWalletChoosen: boolean;
	embeddedAccount?: string | null;
	rank: {
		id: number;
		name: string;
		feeRateBps: number;
	};
	points: number;
	accumulativePoints: number;
	isTop100: boolean;
	referralData: any[];
	enrolledInPointsProgram: boolean;
	leaderboardPosition: number;
	referredUsersCount: number;
}

export class GetUserProfileService {
	async execute(address: string): Promise<UserProfile> {
		try {
			// Test the undocumented endpoint
			const profile = await client.request<UserProfile>(
				`/profiles/${address}`,
				{
					method: "GET",
				},
			);

			return profile;
		} catch (error: any) {
			if (error.message.includes("404")) {
				throw new Error(
					`Profile not found for address: ${address}. This user may not have a profile set up.`,
				);
			}
			if (error.message.includes("401") || error.message.includes("403")) {
				throw new Error(
					`Authentication required or insufficient permissions to access profile for address: ${address}`,
				);
			}
			throw new Error(`Failed to get user profile: ${error.message}`);
		}
	}

	format(profile: UserProfile): string {
		const lines: string[] = [];

		lines.push("=== USER PROFILE ===\n");
		lines.push(`Address: ${profile.account}`);
		lines.push(`Id: ${profile.id}`);
		lines.push(`Username: ${profile.username}`);

		if (profile.displayName && profile.displayName !== profile.username) {
			lines.push(`Display Name: ${profile.displayName}`);
		}

		if (profile.bio) {
			lines.push(`\nBio: ${profile.bio}`);
		}

		if (profile.pfpUrl) {
			lines.push(`\nProfile Picture: ${profile.pfpUrl}`);
		}

		if (profile.socialUrl) {
			lines.push(`Social URL: ${profile.socialUrl}`);
		}

		lines.push("\n=== STATISTICS ===");
		lines.push(`Points: ${profile.points.toLocaleString()}`);
		lines.push(
			`Accumulative Points: ${profile.accumulativePoints.toLocaleString()}`,
		);
		lines.push(`Leaderboard Position: #${profile.leaderboardPosition}`);
		lines.push(`Is Top 100: ${profile.isTop100 ? "Yes" : "No"}`);

		lines.push("\n=== RANK ===");
		lines.push(`Rank: ${profile.rank.name}`);
		lines.push(`Fee Rate: ${(profile.rank.feeRateBps / 100).toFixed(2)}%`);

		lines.push("\n=== STATUS ===");
		lines.push(`Has Traded: ${profile.hasTraded ? "Yes" : "No"}`);
		lines.push(`Is Creator: ${profile.isCreator ? "Yes" : "No"}`);
		lines.push(`Is Onboarded: ${profile.isOnboarded ? "Yes" : "No"}`);
		lines.push(`Is Admin: ${profile.isAdmin ? "Yes" : "No"}`);
		lines.push(
			`Enrolled in Points Program: ${profile.enrolledInPointsProgram ? "Yes" : "No"}`,
		);

		lines.push("\n=== REFERRALS ===");
		lines.push(`Referral Code: ${profile.referralCode}`);
		lines.push(`Referred Users: ${profile.referredUsersCount}`);

		lines.push("\n=== ACCOUNT DETAILS ===");
		lines.push(`Client Type: ${profile.client}`);
		lines.push(`Mode: ${profile.mode}`);

		if (profile.smartWallet) {
			lines.push(`Smart Wallet: ${profile.smartWallet}`);
		}

		if (profile.embeddedAccount) {
			lines.push(`Embedded Account: ${profile.embeddedAccount}`);
		}

		return lines.join("\n");
	}
}
