import { beforeEach, describe, expect, it, vi } from "vitest";
import { SessionManager } from "../../../src/lib/session-manager.js";
import type { CookieJar } from "tough-cookie";

// Mock fetch-cookie
vi.mock("fetch-cookie", () => ({
	default: vi.fn((fetch: any, jar: any) => fetch),
}));

// Mock tough-cookie
vi.mock("tough-cookie", () => ({
	CookieJar: vi.fn(() => ({
		getCookies: vi.fn(),
		removeAllCookies: vi.fn(),
	})),
}));

describe("SessionManager", () => {
	let sessionManager: SessionManager;
	let mockCookieJar: any;

	beforeEach(() => {
		vi.clearAllMocks();
		sessionManager = new SessionManager("https://api.limitless.exchange");
		mockCookieJar = (sessionManager as any).cookieJar;
	});

	describe("isAuthenticated", () => {
		it("should return true when limitless_session cookie exists", async () => {
			mockCookieJar.getCookies.mockResolvedValueOnce([
				{ key: "limitless_session", value: "abc123" },
			]);

			const result = await sessionManager.isAuthenticated();

			expect(result).toBe(true);
		});

		it("should return false when no limitless_session cookie exists", async () => {
			mockCookieJar.getCookies.mockResolvedValueOnce([
				{ key: "other_cookie", value: "xyz" },
			]);

			const result = await sessionManager.isAuthenticated();

			expect(result).toBe(false);
		});

		it("should return false when getCookies fails", async () => {
			mockCookieJar.getCookies.mockRejectedValueOnce(
				new Error("Cookie jar error"),
			);

			const result = await sessionManager.isAuthenticated();

			expect(result).toBe(false);
		});
	});

	describe("verifySession", () => {
		it("should return null when no session cookie exists", async () => {
			mockCookieJar.getCookies.mockResolvedValueOnce([]);

			const result = await sessionManager.verifySession();

			expect(result).toBeNull();
		});

		it("should return address when session is valid", async () => {
			const mockAddress = "0x1234567890123456789012345678901234567890";

			// Mock cookie exists (called by isAuthenticated in verifySession)
			mockCookieJar.getCookies.mockResolvedValue([
				{ key: "limitless_session", value: "abc123" },
			]);

			// Mock successful verify-auth API call (returns text, not JSON)
			const mockFetch = vi.fn().mockResolvedValueOnce({
				ok: true,
				headers: {
					get: (name: string) =>
						name === "content-type" ? "text/plain" : null,
				},
				text: async () => mockAddress,
			});
			(sessionManager as any).customFetch = mockFetch;

			const result = await sessionManager.verifySession();

			expect(result).toBe(mockAddress);
		});

		it("should clear session and return null when session cookie exists but verification fails", async () => {
			// Mock cookie exists (called multiple times)
			mockCookieJar.getCookies.mockResolvedValue([
				{ key: "limitless_session", value: "abc123" },
			]);

			// Mock failed verify-auth API call (401)
			const mockFetch = vi.fn().mockResolvedValueOnce({
				ok: false,
				status: 401,
				statusText: "Unauthorized",
				text: async () => "Unauthorized",
			});
			(sessionManager as any).customFetch = mockFetch;

			const result = await sessionManager.verifySession();

			expect(result).toBeNull();
			expect(mockCookieJar.removeAllCookies).toHaveBeenCalled();
		});

		it("should return null when isAuthenticated encounters an error", async () => {
			// When isAuthenticated errors, it returns false and we return null without clearing
			mockCookieJar.getCookies.mockRejectedValueOnce(
				new Error("Cookie jar error"),
			);

			const result = await sessionManager.verifySession();

			expect(result).toBeNull();
			// Should not call removeAllCookies when isAuthenticated fails
			expect(mockCookieJar.removeAllCookies).not.toHaveBeenCalled();
		});

		it("should clear session and return null when getAuthenticatedAddress throws", async () => {
			// Mock cookie exists
			mockCookieJar.getCookies.mockResolvedValue([
				{ key: "limitless_session", value: "abc123" },
			]);

			// Mock fetch that throws an error after the isAuthenticated check
			const mockFetch = vi
				.fn()
				.mockRejectedValueOnce(new Error("Unexpected network error"));
			(sessionManager as any).customFetch = mockFetch;

			const result = await sessionManager.verifySession();

			expect(result).toBeNull();
			// Should clear session when an unexpected error occurs during verification
			expect(mockCookieJar.removeAllCookies).toHaveBeenCalled();
		});
	});

	describe("getAuthenticatedAddress", () => {
		it("should return null when not authenticated", async () => {
			mockCookieJar.getCookies.mockResolvedValueOnce([]);

			const result = await sessionManager.getAuthenticatedAddress();

			expect(result).toBeNull();
		});

		it("should return address when authenticated", async () => {
			const mockAddress = "0x1234567890123456789012345678901234567890";

			// Mock cookie exists
			mockCookieJar.getCookies.mockResolvedValueOnce([
				{ key: "limitless_session", value: "abc123" },
			]);

			// Mock successful verify-auth API call (returns text, not JSON)
			const mockFetch = vi.fn().mockResolvedValueOnce({
				ok: true,
				headers: {
					get: (name: string) =>
						name === "content-type" ? "text/plain" : null,
				},
				text: async () => mockAddress,
			});
			(sessionManager as any).customFetch = mockFetch;

			const result = await sessionManager.getAuthenticatedAddress();

			expect(result).toBe(mockAddress);
		});

		it("should return null when verify-auth fails", async () => {
			// Mock cookie exists
			mockCookieJar.getCookies.mockResolvedValueOnce([
				{ key: "limitless_session", value: "abc123" },
			]);

			// Mock failed verify-auth API call
			const mockFetch = vi.fn().mockResolvedValueOnce({
				ok: false,
				status: 401,
				statusText: "Unauthorized",
				text: async () => "Unauthorized",
			});
			(sessionManager as any).customFetch = mockFetch;

			const result = await sessionManager.getAuthenticatedAddress();

			expect(result).toBeNull();
		});
	});

	describe("clearSession", () => {
		it("should remove all cookies", async () => {
			mockCookieJar.removeAllCookies.mockResolvedValueOnce(undefined);

			await sessionManager.clearSession();

			expect(mockCookieJar.removeAllCookies).toHaveBeenCalled();
		});

		it("should throw error when removeAllCookies fails", async () => {
			const error = new Error("Failed to clear cookies");
			mockCookieJar.removeAllCookies.mockRejectedValueOnce(error);

			await expect(sessionManager.clearSession()).rejects.toThrow(
				"Failed to clear cookies",
			);
		});
	});

	describe("getCookies", () => {
		it("should return formatted cookie strings", async () => {
			mockCookieJar.getCookies.mockResolvedValueOnce([
				{ key: "cookie1", value: "value1" },
				{ key: "cookie2", value: "value2" },
			]);

			const result = await sessionManager.getCookies();

			expect(result).toEqual(["cookie1=value1", "cookie2=value2"]);
		});

		it("should return empty array on error", async () => {
			mockCookieJar.getCookies.mockRejectedValueOnce(new Error("Error"));

			const result = await sessionManager.getCookies();

			expect(result).toEqual([]);
		});
	});
});
