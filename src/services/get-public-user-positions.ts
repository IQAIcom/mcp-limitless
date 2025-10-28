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

interface PublicUserPositionsResponse {
	positions: Position[];
	totalValue: number;
	totalPnl: number;
	totalPnlPercent: number;
}

export class GetPublicUserPositionsService {
	async execute(account: string): Promise<PublicUserPositionsResponse> {
		try {
			const response = await client.request<PublicUserPositionsResponse>(
				`/portfolio/${account}/positions`,
			);

			if (!response) {
				throw new Error("Unable to retrieve user positions");
			}

			return response;
		} catch (error: any) {
			throw new Error(`Failed to get user positions: ${error.message}`);
		}
	}

	format(response: PublicUserPositionsResponse, account: string): string {
		if (!response.positions || response.positions.length === 0) {
			return `No active positions found for user: ${account}`;
		}

		const formattedPositions = response.positions.map((position: Position) => {
			const pnlSign = position.pnl >= 0 ? "+" : "";
			return dedent`
				📍 ${position.market} - ${position.outcome}
				- Quantity: ${position.quantity}
				- Avg Price: ${position.avgPrice.toFixed(4)}
				- Current Price: ${position.currentPrice.toFixed(4)}
				- P&L: ${pnlSign}$${position.pnl.toFixed(2)} (${pnlSign}${position.pnlPercent.toFixed(2)}%)
			`;
		});

		const totalPnlSign = response.totalPnl >= 0 ? "+" : "";

		return dedent`
			💼 Positions for ${account}

			${formattedPositions.join("\n\n")}

			📊 Portfolio Summary:
			- Total Value: $${response.totalValue.toFixed(2)}
			- Total P&L: ${totalPnlSign}$${response.totalPnl.toFixed(2)} (${totalPnlSign}${response.totalPnlPercent.toFixed(2)}%)
			- Active Positions: ${response.positions.length}
		`;
	}
}
