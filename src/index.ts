#!/usr/bin/env node
import { FastMCP } from "fastmcp";
// Authentication
import { authLoginTool } from "./tools/auth-login.js";
import { authLogoutTool } from "./tools/auth-logout.js";
import { authSigningMessageTool } from "./tools/auth-signing-message.js";
import { authVerifyTool } from "./tools/auth-verify.js";
import { getAuthStatusTool } from "./tools/get-auth-status.js";
// Order Management
import { cancelAllOrdersTool } from "./tools/cancel-all-orders.js";
import { cancelOrderBatchTool } from "./tools/cancel-order-batch.js";
import { cancelOrderTool } from "./tools/cancel-order.js";
import { createOrderTool } from "./tools/create-order.js";
// Market Discovery & Information
import { getActiveMarketsByCategoryTool } from "./tools/get-active-markets-by-category.js";
import { getActiveMarketsTool } from "./tools/get-active-markets.js";
import { getActiveSlugsTool } from "./tools/get-active-slugs.js";
import { getCategoriesCountTool } from "./tools/get-categories-count.js";
import { getFeedEventsTool } from "./tools/get-feed-events.js";
import { getHistoricalPriceTool } from "./tools/get-historical-price.js";
import { getLockedBalanceTool } from "./tools/get-locked-balance.js";
import { getMarketEventsTool } from "./tools/get-market-events.js";
import { getMarketOrderbookTool } from "./tools/get-market-orderbook.js";
import { getMarketTool } from "./tools/get-market.js";
// Portfolio Management
import { getPortfolioHistoryTool } from "./tools/get-portfolio-history.js";
import { getPortfolioPointsTool } from "./tools/get-portfolio-points.js";
import { getPortfolioPositionsTool } from "./tools/get-portfolio-positions.js";
import { getPortfolioTradesTool } from "./tools/get-portfolio-trades.js";
import { getPublicUserPositionsTool } from "./tools/get-public-user-positions.js";
import { getTradingAllowanceTool } from "./tools/get-trading-allowance.js";
import { getUserOrdersTool } from "./tools/get-user-orders.js";
import { getUserTradedVolumeTool } from "./tools/get-user-traded-volume.js";
import { searchMarketsTool } from "./tools/search-markets.js";

async function main() {
	console.log("Initializing Limitless MCP Server...");

	const server = new FastMCP({
		name: "Limitless MCP Server",
		version: "0.0.1",
	});

	// Authentication Tools
	server.addTool(getAuthStatusTool); // Check session status
	server.addTool(authSigningMessageTool);
	server.addTool(authVerifyTool);
	server.addTool(authLoginTool);
	server.addTool(authLogoutTool);

	// Market Discovery & Information Tools
	server.addTool(searchMarketsTool);
	server.addTool(getMarketTool);
	server.addTool(getActiveMarketsTool);
	server.addTool(getActiveMarketsByCategoryTool);
	server.addTool(getCategoriesCountTool);
	server.addTool(getActiveSlugsTool);
	server.addTool(getMarketOrderbookTool);
	server.addTool(getHistoricalPriceTool);
	server.addTool(getFeedEventsTool);
	server.addTool(getMarketEventsTool);
	server.addTool(getLockedBalanceTool);
	server.addTool(getUserOrdersTool);

	// Portfolio Management Tools
	server.addTool(getPortfolioPositionsTool);
	server.addTool(getPortfolioTradesTool);
	server.addTool(getPortfolioHistoryTool);
	server.addTool(getPortfolioPointsTool);
	server.addTool(getUserTradedVolumeTool);
	server.addTool(getPublicUserPositionsTool);
	server.addTool(getTradingAllowanceTool);

	// Order Management Tools
	server.addTool(createOrderTool);
	server.addTool(cancelOrderTool);
	server.addTool(cancelOrderBatchTool);
	server.addTool(cancelAllOrdersTool);

	try {
		await server.start({
			transportType: "stdio",
		});
		console.log("✅ Limitless MCP Server started successfully over stdio.");
		console.log("   You can now connect to it using an MCP client.");
		console.log("");
		console.log("   🔐 Session Management:");
		console.log(
			"      - Automatic cookie-based session persistence (like a browser!)",
		);
		console.log(
			"      - Once authenticated, session persists across all tool calls",
		);
		console.log("      - Check status anytime with GET_AUTH_STATUS tool");
		console.log("");
		console.log("   Total Available Tools: 28");
		console.log("");
		console.log("   📝 Authentication (5):");
		console.log(
			"      - GET_AUTH_STATUS, GET_SIGNING_MESSAGE, VERIFY_AUTH, LOGIN, LOGOUT",
		);
		console.log("");
		console.log("   📊 Markets (12):");
		console.log(
			"      - SEARCH_MARKETS, GET_MARKET, GET_ACTIVE_MARKETS, GET_ACTIVE_MARKETS_BY_CATEGORY",
		);
		console.log(
			"      - GET_CATEGORIES_COUNT, GET_ACTIVE_SLUGS, GET_MARKET_ORDERBOOK, GET_HISTORICAL_PRICE",
		);
		console.log(
			"      - GET_FEED_EVENTS, GET_MARKET_EVENTS, GET_LOCKED_BALANCE, GET_USER_ORDERS",
		);
		console.log("");
		console.log("   💼 Portfolio (7):");
		console.log(
			"      - GET_PORTFOLIO_POSITIONS, GET_PORTFOLIO_TRADES, GET_PORTFOLIO_HISTORY",
		);
		console.log(
			"      - GET_PORTFOLIO_POINTS, GET_USER_TRADED_VOLUME, GET_PUBLIC_USER_POSITIONS",
		);
		console.log("      - GET_TRADING_ALLOWANCE");
		console.log("");
		console.log("   🔄 Trading (4):");
		console.log(
			"      - CREATE_ORDER, CANCEL_ORDER, CANCEL_ORDER_BATCH, CANCEL_ALL_ORDERS",
		);
	} catch (error) {
		console.error("❌ Failed to start Limitless MCP Server:", error);
		process.exit(1);
	}
}

main().catch((error) => {
	console.error(
		"❌ An unexpected error occurred in the Limitless MCP Server:",
		error,
	);
	process.exit(1);
});
