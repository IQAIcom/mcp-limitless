import dedent from "dedent";
import { client } from "../lib/client.js";

interface GetMarketEventsParams {
	slug: string;
	page?: number;
	limit?: number;
}

interface MarketEvent {
	eventType?: string;
	type?: string; // For backward compatibility, map eventType to type
	timestamp?: string;
	createdAt?: string; // API returns createdAt, map to timestamp
	data?: {
		id?: string;
		[key: string]: any;
	};
	[key: string]: any;
}

interface MarketEventsResponse {
	events: MarketEvent[];
	total?: number;
	page?: number;
	limit?: number;
}

export class GetMarketEventsService {
	async execute(params: GetMarketEventsParams): Promise<MarketEventsResponse> {
		try {
			const queryParams = new URLSearchParams();
			if (params.page) queryParams.append("page", params.page.toString());
			if (params.limit) queryParams.append("limit", params.limit.toString());

			const endpoint = `/markets/${params.slug}/events${
				queryParams.toString() ? `?${queryParams.toString()}` : ""
			}`;

			const response = await client.request<MarketEventsResponse>(endpoint);

			if (!response) {
				throw new Error("Unable to retrieve market events");
			}

			// Map eventType to type and createdAt to timestamp for backward compatibility
			if (response.events) {
				response.events = response.events.map((event) => ({
					...event,
					type: event.eventType || event.type || "TRADE",
					timestamp: event.timestamp || event.createdAt,
				}));
			}

			return response;
		} catch (error: any) {
			throw new Error(`Failed to get market events: ${error.message}`);
		}
	}

	format(response: MarketEventsResponse, slug: string): string {
		if (!response.events || response.events.length === 0) {
			return `No events found for market: ${slug}`;
		}

		const formattedEvents = response.events
			.slice(0, 10)
			.map((event: MarketEvent) => {
				const timestamp = event.timestamp
					? new Date(event.timestamp).toLocaleString()
					: "N/A";
				const eventId = event.data?.id || "N/A";
				return dedent`
				⚡ ${event.type}
				- ID: ${eventId}
				- Time: ${timestamp}
			`;
			});

		return dedent`
			⚡ Market Events for ${slug}

			${formattedEvents.join("\n\n")}

			📊 Summary:
			- Total Events: ${response.total || response.events.length}
			- Showing: ${response.events.length} events
		`;
	}
}
