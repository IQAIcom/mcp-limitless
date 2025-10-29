/**
 * Fixture data for authentication API responses
 */

export const signingMessageResponse = {
	message: "Sign this message to authenticate with Limitless",
	nonce: "abc123def456",
	timestamp: "2024-10-29T12:00:00Z",
};

export const loginSuccessResponse = {
	success: true,
	token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
	user: {
		address: "0x1234567890abcdef",
		username: "testuser",
	},
	expiresAt: "2024-10-30T12:00:00Z",
};

export const loginFailureResponse = {
	success: false,
	error: "Invalid signature",
};

export const verifyAuthSuccessResponse = {
	authenticated: true,
	user: {
		address: "0x1234567890abcdef",
		username: "testuser",
	},
};

export const verifyAuthFailureResponse = {
	authenticated: false,
};

export const logoutSuccessResponse = {
	success: true,
	message: "Logged out successfully",
};
