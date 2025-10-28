import { z } from "zod";
import { GetFeedEventsService } from "../services/get-feed-events.js";

const getFeedEventsParams = z.object({
	slug: z.string().describe("Market slug identifier"),
	page: z.number().optional().describe("Page number for pagination"),
	limit: z.number().optional().describe("Number of events per page"),
});

type GetFeedEventsParams = z.infer<typeof getFeedEventsParams>;

export const getFeedEventsTool = {
	name: "GET_FEED_EVENTS",
	description:
		"Get the latest feed events related to a specific market with pagination support.",
	parameters: getFeedEventsParams,
	execute: async (params: GetFeedEventsParams) => {
		try {
			const service = new GetFeedEventsService();
			const response = await service.execute(params);

			return service.format(response, params.slug);
		} catch (error) {
			if (error instanceof Error) {
				console.log(`Error in GET_FEED_EVENTS tool: ${error.message}`);
				return `Error getting feed events: ${error.message}`;
			}
			return "An unknown error occurred while fetching feed events";
		}
	},
} as const;
