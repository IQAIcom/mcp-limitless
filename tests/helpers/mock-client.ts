import { LimitlessAPIClient } from "../../src/lib/client.js";

interface MockResponse {
	endpoint: string;
	response: any;
	method?: string;
	statusCode?: number;
	error?: string;
}

/**
 * Mock implementation of LimitlessAPIClient for testing
 * Allows defining expected responses for specific endpoints
 */
export class MockLimitlessAPIClient extends LimitlessAPIClient {
	private mockResponses: Map<string, MockResponse> = new Map();

	/**
	 * Add a mock response for a specific endpoint
	 */
	addMockResponse(mockResponse: MockResponse) {
		const key = `${mockResponse.method || "GET"}:${mockResponse.endpoint}`;
		this.mockResponses.set(key, mockResponse);
	}

	/**
	 * Clear all mock responses
	 */
	clearMockResponses() {
		this.mockResponses.clear();
	}

	/**
	 * Override the request method to return mocked responses
	 */
	async request<T>(endpoint: string, options: any = {}): Promise<T> {
		const method = options.method || "GET";
		const key = `${method}:${endpoint}`;

		const mockResponse = this.mockResponses.get(key);

		if (!mockResponse) {
			throw new Error(
				`No mock response defined for ${method} ${endpoint}. Available mocks: ${Array.from(this.mockResponses.keys()).join(", ")}`,
			);
		}

		// Simulate API error
		if (mockResponse.error) {
			throw new Error(mockResponse.error);
		}

		// Simulate non-200 status code
		if (mockResponse.statusCode && mockResponse.statusCode !== 200) {
			throw new Error(
				`API request failed: ${mockResponse.statusCode} ${mockResponse.error || "Error"}`,
			);
		}

		// Return successful mock response
		return mockResponse.response as T;
	}
}

/**
 * Create a new mock client instance
 */
export function createMockClient(): MockLimitlessAPIClient {
	return new MockLimitlessAPIClient();
}
