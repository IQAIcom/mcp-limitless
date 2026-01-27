/**
 * Fixture data for search markets API responses
 */

export const searchMarketsSuccessResponse = {
	markets: [
		{
			title: "Will Bitcoin reach $100,000 by end of 2024?",
			slug: "bitcoin-100k-2024",
			category: "Crypto",
			volume: "125000",
			liquidity: "50000",
			endDate: "2024-12-31T23:59:59Z",
		},
		{
			title: "Will Ethereum complete the merge successfully?",
			slug: "ethereum-merge-success",
			category: "Crypto",
			volume: "85000",
			liquidity: "32000",
			endDate: "2024-09-15T00:00:00Z",
		},
	],
	total: 2,
	page: 1,
	limit: 10,
};

export const searchMarketsEmptyResponse = {
	markets: [],
	total: 0,
	page: 1,
	limit: 10,
};

export const searchMarketsPaginatedResponse = {
	markets: [
		{
			title: "Will AI surpass human intelligence by 2030?",
			slug: "ai-agi-2030",
			category: "Technology",
			volume: "200000",
			liquidity: "75000",
			endDate: "2030-01-01T00:00:00Z",
		},
	],
	total: 25,
	page: 2,
	limit: 1,
};
