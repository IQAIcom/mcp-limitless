/**
 * Fixture data for market detail API responses
 */

export const marketDetailSuccessResponse = {
	id: "0x1234567890abcdef",
	address: "0x1234567890abcdef",
	question: "Will Bitcoin reach $100,000 by end of 2024?",
	slug: "bitcoin-100k-2024",
	description:
		"This market resolves to YES if Bitcoin (BTC) reaches or exceeds $100,000 USD at any point before December 31, 2024 11:59:59 PM UTC.",
	category: "Crypto",
	categoryId: "crypto",
	createdAt: "2024-01-01T00:00:00Z",
	endDate: "2024-12-31T23:59:59Z",
	resolved: false,
	outcome: null,
	volume: "125000",
	liquidity: "50000",
	yesPrice: "0.65",
	noPrice: "0.35",
	positions: {
		yes: {
			price: "0.65",
			shares: "76923",
		},
		no: {
			price: "0.35",
			shares: "142857",
		},
	},
	creator: "0xabcdef1234567890",
	metadata: {
		tags: ["bitcoin", "cryptocurrency", "price"],
		source: "CoinGecko",
	},
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
