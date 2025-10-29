/**
 * Fixture data for market detail API responses
 */

// What the API actually returns
export const marketDetailAPIResponse = {
	title: "Will Bitcoin reach $100,000 by end of 2024?",
	slug: "bitcoin-100k-2024",
	address: "0x1234567890abcdef",
	categories: ["Crypto"],
	description:
		"This market resolves to YES if Bitcoin (BTC) reaches or exceeds $100,000 USD at any point before December 31, 2024 11:59:59 PM UTC.",
	expirationDate: "2024-12-31T23:59:59Z",
	volume: "125000",
	volumeFormatted: "125000",
	liquidity: "50000",
	liquidityFormatted: "50000",
	marketType: "Binary",
	status: "Active",
};

// What the service should return after transformation
export const marketDetailSuccessResponse = {
	question: "Will Bitcoin reach $100,000 by end of 2024?",
	slug: "bitcoin-100k-2024",
	address: "0x1234567890abcdef",
	category: "Crypto",
	description:
		"This market resolves to YES if Bitcoin (BTC) reaches or exceeds $100,000 USD at any point before December 31, 2024 11:59:59 PM UTC.",
	endDate: "2024-12-31T23:59:59Z",
	volume: "125000",
	liquidity: "50000",
	marketType: "Binary",
	status: "Active",
};

export const marketDetailResolvedResponse = {
	...marketDetailSuccessResponse,
	resolved: true,
	outcome: "YES",
	resolvedAt: "2024-11-15T10:30:00Z",
};

export const marketDetailNotFoundResponse = {
	error: "Market not found",
	statusCode: 404,
};
