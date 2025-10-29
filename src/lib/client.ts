import { sessionManager } from "./session-manager.js";

interface RequestOptions {
	method?: string;
	headers?: Record<string, string>;
	body?: any;
}

/**
 * Limitless API Client
 *
 * This client now uses a session manager with cookie jar support,
 * allowing automatic session persistence across requests.
 *
 * Authentication flow:
 * 1. User calls LOGIN tool with wallet signature
 * 2. API returns Set-Cookie header with session
 * 3. Session automatically persists for all subsequent requests
 * 4. No need to pass apiKey/token with each request
 */
export class LimitlessAPIClient {
	async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
		const { method = "GET", headers = {}, body } = options;

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

		// Use session manager for automatic cookie handling
		return sessionManager.request<T>(endpoint, fetchOptions);
	}

	/**
	 * Check if user is authenticated
	 */
	async isAuthenticated(): Promise<boolean> {
		return sessionManager.isAuthenticated();
	}

	/**
	 * Get authenticated user's address
	 */
	async getAuthenticatedAddress(): Promise<string | null> {
		return sessionManager.getAuthenticatedAddress();
	}

	/**
	 * Clear session (logout)
	 */
	async clearSession(): Promise<void> {
		return sessionManager.clearSession();
	}
}

export const client = new LimitlessAPIClient();
