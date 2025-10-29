import { sessionManager } from "./session-manager.js";

interface RequestOptions {
	method?: string;
	headers?: Record<string, string>;
	body?: any;
}

/**
 * Limitless API Client
 *
 * This client uses a session manager with cookie jar support,
 * allowing automatic session persistence across requests.
 *
 * Authentication flow:
 * 1. User calls LOGIN tool with wallet signature
 * 2. API returns Set-Cookie header with session
 * 3. Session automatically persists for all subsequent requests
 * 4. Session cookies are handled automatically
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
	 * Check if user is authenticated (cookie exists)
	 * Note: This only checks cookie existence, not validity.
	 * Use verifySession() to verify the session is valid.
	 */
	async isAuthenticated(): Promise<boolean> {
		return sessionManager.isAuthenticated();
	}

	/**
	 * Verify session is valid and get authenticated user's address
	 * Automatically clears invalid sessions
	 * Returns address if valid, null otherwise
	 */
	async verifySession(): Promise<string | null> {
		return sessionManager.verifySession();
	}

	/**
	 * Get authenticated user's address
	 * Does not clear invalid sessions - use verifySession() for that
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
