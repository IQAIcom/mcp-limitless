/**
 * Fixture data for portfolio API responses
 */

export const portfolioPositionsResponse = {
	positions: [
		{
			marketSlug: "bitcoin-100k-2024",
			question: "Will Bitcoin reach $100,000 by end of 2024?",
			outcome: "YES",
			shares: "1000",
			averagePrice: "0.60",
			currentPrice: "0.65",
			invested: "600",
			currentValue: "650",
			profitLoss: "50",
			profitLossPercentage: "8.33",
		},
		{
			marketSlug: "ethereum-merge-success",
			question: "Will Ethereum complete the merge successfully?",
			outcome: "NO",
			shares: "500",
			averagePrice: "0.40",
			currentPrice: "0.35",
			invested: "200",
			currentValue: "175",
			profitLoss: "-25",
			profitLossPercentage: "-12.5",
		},
	],
	totalInvested: "800",
	totalCurrentValue: "825",
	totalProfitLoss: "25",
	totalProfitLossPercentage: "3.125",
};

export const portfolioTradesResponse = {
	trades: [
		{
			id: "trade-1",
			marketSlug: "bitcoin-100k-2024",
			question: "Will Bitcoin reach $100,000 by end of 2024?",
			outcome: "YES",
			type: "BUY",
			shares: "500",
			price: "0.60",
			total: "300",
			timestamp: "2024-10-20T10:00:00Z",
			fee: "1.5",
		},
		{
			id: "trade-2",
			marketSlug: "bitcoin-100k-2024",
			question: "Will Bitcoin reach $100,000 by end of 2024?",
			outcome: "YES",
			type: "BUY",
			shares: "500",
			price: "0.60",
			total: "300",
			timestamp: "2024-10-21T14:30:00Z",
			fee: "1.5",
		},
	],
	total: 2,
};

export const portfolioPointsResponse = {
	totalPoints: 1250,
	breakdown: {
		trading: 800,
		liquidity: 300,
		referrals: 150,
	},
	rank: 1543,
	percentile: "85.5",
};
