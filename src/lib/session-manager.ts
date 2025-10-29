/**
 * Session Manager for Limitless API
 *
 * Manages HTTP session cookies automatically, similar to browser behavior.
 * This allows the MCP server to maintain authentication state across tool calls
 * without requiring users to pass tokens manually.
 */

import fetchCookie from "fetch-cookie";
import { CookieJar } from "tough-cookie";
import { LIMITLESS_API_BASE_URL } from "../constants.js";

export class SessionManager {
	private cookieJar: CookieJar;
	private customFetch: typeof fetch;
	private baseURL: string;

	constructor(baseURL: string = LIMITLESS_API_BASE_URL) {
		this.baseURL = baseURL;
		this.cookieJar = new CookieJar();
		// Wrap native fetch with cookie handling
		this.customFetch = fetchCookie(fetch, this.cookieJar);
	}

	/**
	 * Make an HTTP request with automatic cookie handling
	 * Cookies from Set-Cookie headers are automatically stored and sent on subsequent requests
	 */
	async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const url = `${this.baseURL}${endpoint}`;

		const response = await this.customFetch(url, {
			...options,
			headers: {
				"Content-Type": "application/json",
				...options.headers,
			},
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(
				`API request failed: ${response.status} ${response.statusText} - ${errorText}`,
			);
		}

		// Try to parse as JSON first, fall back to text if it fails
		const contentType = response.headers.get("content-type");
		if (contentType?.includes("application/json")) {
			return response.json();
		}

		// For text responses (like verify-auth endpoint), return as-is
		const text = await response.text();
		return text as T;
	}

	/**
	 * Check if there's an active session
	 * Returns true if a limitless_session cookie exists
	 * Note: This only checks cookie existence, not validity.
	 * Use verifySession() or getAuthenticatedAddress() to verify the session is valid.
	 */
	async isAuthenticated(): Promise<boolean> {
		try {
			const cookies = await this.cookieJar.getCookies(this.baseURL);
			return cookies.some((cookie) => cookie.key === "limitless_session");
		} catch (error) {
			console.error("Error checking authentication status:", error);
			return false;
		}
	}

	/**
	 * Verify session is valid by checking both cookie existence and API verification
	 * Returns the authenticated address if valid, null otherwise
	 * Automatically clears invalid sessions
	 */
	async verifySession(): Promise<string | null> {
		try {
			const hasCookie = await this.isAuthenticated();
			if (!hasCookie) {
				return null;
			}

			// Verify with API
			const address = await this.getAuthenticatedAddress();

			// If cookie exists but API verification fails, clear the invalid session
			if (!address) {
				await this.clearSession();
				return null;
			}

			return address;
		} catch (error) {
			console.error("Error verifying session:", error);
			// Clear potentially invalid session
			await this.clearSession();
			return null;
		}
	}

	/**
	 * Get the current session address if authenticated
	 * Makes a request to verify-auth endpoint to get the address
	 */
	async getAuthenticatedAddress(): Promise<string | null> {
		try {
			const isAuth = await this.isAuthenticated();
			if (!isAuth) {
				return null;
			}

			// Try to get the address from verify-auth endpoint
			const address = await this.request<string>("/auth/verify-auth", {
				method: "GET",
			});

			return address;
		} catch (error) {
			return null;
		}
	}

	/**
	 * Clear all session cookies
	 * Effectively logs out by removing authentication state
	 */
	async clearSession(): Promise<void> {
		try {
			await this.cookieJar.removeAllCookies();
		} catch (error) {
			console.error("Error clearing session:", error);
			throw error;
		}
	}

	/**
	 * Get all cookies for debugging
	 */
	async getCookies(): Promise<string[]> {
		try {
			const cookies = await this.cookieJar.getCookies(this.baseURL);
			return cookies.map((c) => `${c.key}=${c.value}`);
		} catch (error) {
			console.error("Error getting cookies:", error);
			return [];
		}
	}

	/**
	 * Get the underlying cookie jar for advanced use cases
	 */
	getCookieJar(): CookieJar {
		return this.cookieJar;
	}
}

// Global singleton instance
export const sessionManager = new SessionManager();
