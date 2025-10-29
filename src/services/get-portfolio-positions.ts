import dedent from "dedent";
import { client } from "../lib/client.js";

interface Position {
	market: string;
	outcome: string;
	quantity: number;
	avgPrice: number;
	currentPrice: number;
	pnl: number;
	pnlPercent: number;
}

interface PortfolioPositionsResponse {
	positions: Position[];
	totalValue: number;
	totalPnl: number;
	totalPnlPercent: number;
}

export class GetPortfolioPositionsService {
	async execute(apiKey?: string): Promise<PortfolioPositionsResponse> {
		try {
			const headers: Record<string, string> = {};
			if (apiKey) {
				headers.Authorization = `Bearer ${apiKey}`;
			}

			const response = await client.request<PortfolioPositionsResponse>(
				"/portfolio/positions",
				{ headers },
			);

			if (!response) {
				throw new Error("Unable to retrieve portfolio positions");
			}

			return response;
		} catch (error: any) {
			if (error.message.includes("401")) {
				throw new Error(
					"Unauthorized. This tool requires authentication with a valid API key or session token.",
				);
			}
			throw new Error(`Failed to get portfolio positions: ${error.message}`);
		}
	}

	format(portfolio: PortfolioPositionsResponse): string {
		if (!portfolio.positions || portfolio.positions.length === 0) {
			return "No active positions found in your portfolio.";
		}

		const formattedPositions = portfolio.positions.map((position: Position) => {
			const pnlSign = position.pnl >= 0 ? "+" : "-";
			const pnlValue = Math.abs(position.pnl);
			const pnlPercentValue = Math.abs(position.pnlPercent);
			return dedent`
                📍 ${position.market} - ${position.outcome}
                - Quantity: ${position.quantity}
                - Avg Price: ${position.avgPrice.toFixed(4)}
                - Current Price: ${position.currentPrice.toFixed(4)}
                - P&L: ${pnlSign}$${pnlValue.toFixed(2)} (${pnlSign}${pnlPercentValue.toFixed(2)}%)
            `;
		});

		const totalPnlSign = portfolio.totalPnl >= 0 ? "+" : "-";
		const totalPnlValue = Math.abs(portfolio.totalPnl);
		const totalPnlPercentValue = Math.abs(portfolio.totalPnlPercent);

		const formattedPortfolio = dedent`
			💼 Portfolio Positions

			${formattedPositions.join("\n\n")}

			📊 Portfolio Summary:
			- Total Value: $${portfolio.totalValue.toFixed(2)}
			- Total P&L: ${totalPnlSign}$${totalPnlValue.toFixed(2)} (${totalPnlSign}${totalPnlPercentValue.toFixed(2)}%)
			- Active Positions: ${portfolio.positions.length}
		`;

		return formattedPortfolio;
	}
}
