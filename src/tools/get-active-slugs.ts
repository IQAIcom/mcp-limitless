import { z } from "zod";
import { GetActiveSlugsService } from "../services/get-active-slugs.js";

const getActiveSlugsParams = z.object({});

type GetActiveSlugsParams = z.infer<typeof getActiveSlugsParams>;

export const getActiveSlugsTool = {
	name: "GET_ACTIVE_SLUGS",
	description:
		"Get slugs, strike prices, tickers, and deadlines for all active markets and groups. Useful for discovering available markets.",
	parameters: getActiveSlugsParams,
	execute: async (_params: GetActiveSlugsParams) => {
		try {
			const service = new GetActiveSlugsService();
			const response = await service.execute();

			return service.format(response);
		} catch (error) {
			if (error instanceof Error) {
				console.log(`Error in GET_ACTIVE_SLUGS tool: ${error.message}`);
				return `Error getting active slugs: ${error.message}`;
			}
			return "An unknown error occurred while fetching active slugs";
		}
	},
} as const;
