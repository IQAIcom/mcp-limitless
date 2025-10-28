import { LIMITLESS_API_BASE_URL } from "../constants.js";

interface RequestOptions {
	method?: string;
	headers?: Record<string, string>;
	body?: any;
}

export class LimitlessAPIClient {
	private baseURL: string;

	constructor(baseURL: string = LIMITLESS_API_BASE_URL) {
		this.baseURL = baseURL;
	}

	async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
		const { method = "GET", headers = {}, body } = options;

		const url = `${this.baseURL}${endpoint}`;

		const fetchOptions: RequestInit = {
			method,
			headers: {
				"Content-Type": "application/json",
				...headers,
			},
		};

		if (body && method !== "GET") {
			fetchOptions.body = JSON.stringify(body);
		}

		const response = await fetch(url, fetchOptions);

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(
				`API request failed: ${response.status} ${response.statusText} - ${errorText}`,
			);
		}

		return response.json();
	}
}

export const client = new LimitlessAPIClient();
