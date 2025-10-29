/**
 * Fixture data for orderbook API responses
 */

export const orderbookSuccessResponse = {
	slug: "bitcoin-100k-2024",
	bids: [
		{
			price: "0.64",
			quantity: "1000",
			total: "640",
		},
		{
			price: "0.63",
			quantity: "2500",
			total: "1575",
		},
		{
			price: "0.62",
			quantity: "5000",
			total: "3100",
		},
	],
	asks: [
		{
			price: "0.66",
			quantity: "800",
			total: "528",
		},
		{
			price: "0.67",
			quantity: "1500",
			total: "1005",
		},
		{
			price: "0.68",
			quantity: "3000",
			total: "2040",
		},
	],
	spread: "0.02",
	lastTrade: {
		price: "0.65",
		quantity: "500",
		timestamp: "2024-10-29T12:00:00Z",
	},
};

export const orderbookEmptyResponse = {
	slug: "low-liquidity-market",
	bids: [],
	asks: [],
	spread: null,
	lastTrade: null,
};
