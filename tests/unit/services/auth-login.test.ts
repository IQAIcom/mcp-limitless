import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthLoginService } from "../../../src/services/auth-login.js";

// Mock the client module
vi.mock("../../../src/lib/client.js", () => ({
	client: {
		request: vi.fn(),
	},
}));

// Import after mocking
import { client } from "../../../src/lib/client.js";

describe("AuthLoginService", () => {
	let service: AuthLoginService;
	const mockClient = client as any;

	beforeEach(() => {
		service = new AuthLoginService();
		vi.clearAllMocks();
	});

	const validLoginParams = {
		account: "0x1234567890123456789012345678901234567890",
		signingMessage: "Sign this message to authenticate",
		signature: "0xabcdef...",
		userData: { name: "Test User", email: "test@example.com" },
	};

	describe("execute", () => {
		it("should successfully login with valid credentials", async () => {
			const mockResponse = {
				account: "0x1234567890123456789012345678901234567890",
				token: "jwt-token",
			};
			mockClient.request.mockResolvedValueOnce(mockResponse);

			const result = await service.execute(validLoginParams);

			// Signing message should be hex-encoded to handle newlines in HTTP headers
			const expectedHexMessage =
				"0x" + Buffer.from(validLoginParams.signingMessage).toString("hex");

			expect(mockClient.request).toHaveBeenCalledWith("/auth/login", {
				method: "POST",
				headers: {
					"x-account": validLoginParams.account,
					"x-signing-message": expectedHexMessage,
					"x-signature": validLoginParams.signature,
				},
				body: validLoginParams.userData,
			});
			expect(result).toEqual(mockResponse);
		});

		it("should throw error when response is empty", async () => {
			mockClient.request.mockResolvedValueOnce(null);

			await expect(service.execute(validLoginParams)).rejects.toThrow(
				"Unable to login",
			);
		});

		it("should handle 401 authentication errors", async () => {
			mockClient.request.mockRejectedValue(new Error("401 Unauthorized"));

			const error = await service.execute(validLoginParams).catch((e) => e);
			expect(error.message).toContain("Authentication failed");
			expect(error.message).toContain("Check your signature and account");
		});

		it("should handle 400 bad request errors", async () => {
			mockClient.request.mockRejectedValueOnce(new Error("400 Bad Request"));

			await expect(service.execute(validLoginParams)).rejects.toThrow(
				"Authentication failed",
			);
		});

		it("should handle network errors", async () => {
			mockClient.request.mockRejectedValueOnce(new Error("Network error"));

			await expect(service.execute(validLoginParams)).rejects.toThrow(
				"Failed to login: Network error",
			);
		});
	});

	describe("format", () => {
		it("should format login response correctly", () => {
			const response = {
				account: "0x1234567890123456789012345678901234567890",
				token: "jwt-token",
			};
			const formatted = service.format(response);

			expect(formatted).toContain("✅ Login Successful!");
			expect(formatted).toContain("Account:");
			expect(formatted).toContain(response.account);
		});

		it("should format response without token", () => {
			const response = {
				account: "0x9876543210987654321098765432109876543210",
			};
			const formatted = service.format(response);

			expect(formatted).toContain("✅ Login Successful!");
			expect(formatted).toContain(response.account);
		});
	});
});
