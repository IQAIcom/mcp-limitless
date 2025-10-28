import dedent from "dedent";
import { client } from "../lib/client.js";

interface GetFeedEventsParams {
	slug: string;
	page?: number;
	limit?: number;
}

interface FeedEvent {
	id: string;
	type: string;
	timestamp: string;
	data: any;
	[key: string]: any;
}

interface FeedEventsResponse {
	events: FeedEvent[];
	total: number;
	page: number;
	limit: number;
}

export class GetFeedEventsService {
	async execute(params: GetFeedEventsParams): Promise<FeedEventsResponse> {
		try {
			const queryParams = new URLSearchParams();
			if (params.page) queryParams.append("page", params.page.toString());
			if (params.limit) queryParams.append("limit", params.limit.toString());

			const endpoint = `/markets/${params.slug}/get-feed-events${
				queryParams.toString() ? `?${queryParams.toString()}` : ""
			}`;

			const response = await client.request<FeedEventsResponse>(endpoint);

			if (!response) {
				throw new Error("Unable to retrieve feed events");
			}

			return response;
		} catch (error: any) {
			throw new Error(`Failed to get feed events: ${error.message}`);
		}
	}

	format(response: FeedEventsResponse, slug: string): string {
		if (!response.events || response.events.length === 0) {
			return `No feed events found for market: ${slug}`;
		}

		const formattedEvents = response.events.map((event: FeedEvent) => {
			const timestamp = new Date(event.timestamp).toLocaleString();
			return dedent`
				📰 ${event.type}
				- ID: ${event.id}
				- Time: ${timestamp}
			`;
		});

		return dedent`
			📰 Feed Events for ${slug}

			${formattedEvents.join("\n\n")}

			📊 Summary:
			- Total Events: ${response.total}
			- Page: ${response.page}
			- Showing: ${response.events.length} events
		`;
	}
}
