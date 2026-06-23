# 🎯 Limitless MCP Server

[![npm version](https://img.shields.io/npm/v/@iqai/mcp-limitless.svg)](https://www.npmjs.com/package/@iqai/mcp-limitless)
[![CI](https://github.com/IQAIcom/mcp-limitless/actions/workflows/ci.yml/badge.svg)](https://github.com/IQAIcom/mcp-limitless/actions/workflows/ci.yml)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## 📖 Overview

The Limitless MCP Server enables AI agents to interact with [Limitless](https://limitless.exchange) prediction markets. This server provides comprehensive tools for market discovery, portfolio management, and trading, enabling AI agents to interact with prediction markets seamlessly.

By implementing the Model Context Protocol (MCP), this server allows Large Language Models (LLMs) to discover prediction markets, execute trades, manage portfolios, and track market activity directly through their context window, bridging the gap between AI and decentralized prediction markets.

## ✨ Features

*   **Market Discovery**: Search and filter prediction markets by category, keywords, and activity.
*   **Real-time Pricing**: Access live price data, order books, and historical price information.
*   **Portfolio Tracking**: Monitor user positions, trade history, points, and P&L calculations.
*   **Trading**: Create, cancel, and manage orders for prediction market positions.
*   **Authentication**: Secure wallet-based authentication with session management.

## 📦 Installation

### 🚀 Using npx (Recommended)

To use this server without installing it globally:

```bash
npx @iqai/mcp-limitless
```

### 🔧 Build from Source

```bash
git clone https://github.com/IQAIcom/mcp-limitless
cd mcp-limitless
pnpm install
pnpm run build
```

## ⚡ Running with an MCP Client

Add the following configuration to your MCP client settings (e.g., `claude_desktop_config.json`).

### 📋 Minimal Configuration

```json
{
  "mcpServers": {
    "limitless": {
      "command": "npx",
      "args": ["@iqai/mcp-limitless"]
    }
  }
}
```

No API key required for read-only operations. Authentication is handled via wallet signature for trading.

### ⚙️ Advanced Configuration (Local Build)

```json
{
  "mcpServers": {
    "limitless": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-limitless/dist/index.js"]
    }
  }
}
```

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

## 🔐 Configuration (Environment Variables)

| Variable | Required | Description | Default |
| :--- | :--- | :--- | :--- |
| None | - | No environment variables required for read-only operations | - |

Authentication is handled via wallet signature flow (GET_SIGNING_MESSAGE → LOGIN).

## 💡 Usage Examples

### 🔍 Market Discovery
*   "What prediction markets are currently active on Limitless?"
*   "Search for crypto-related markets"
*   "Show me the top markets by volume"
*   "Get the order book for the Bitcoin $100k market"

### 📊 Analytics & Pricing
*   "Get the historical price data for this market"
*   "Show me the current orderbook with bids and asks"
*   "What are the feed events for this market?"

### 💼 Portfolio Management
*   "Show me my portfolio positions"
*   "What's my P&L on open positions?"
*   "List my recent trades"
*   "Check my points breakdown"

### 💰 Trading
*   "Place a buy order for 50 shares at 60 cents"
*   "Cancel all my orders in this market"
*   "Show me my open orders"

## 🛠️ MCP Tools

<!-- AUTO-GENERATED TOOLS START -->

### `CANCEL_ALL_ORDERS`
Cancel all of a user's open orders in a specific market on Limitless. Requires authentication.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | ✅ | Market slug to cancel all user orders in |

### `CANCEL_ORDER`
Cancel an open order on Limitless and return locked funds. Requires authentication and order ownership.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `orderId` | string | ✅ | Unique identifier of the order to be cancelled |

### `CANCEL_ORDER_BATCH`
Cancel multiple orders in a single batch operation on Limitless. All orders must be from the same market. Requires authentication and order ownership.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `orderIds` | array | ✅ | Array of order IDs to be cancelled in a single batch operation |

### `CREATE_ORDER`
Create a buy or sell order for prediction market positions on Limitless. Requires signed order data and authentication. Returns order details and match information if filled immediately.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `order` | object | ✅ | Order details including signature and amounts |
| `ownerId` | number | ✅ | Profile ID of the order owner |
| `orderType` | string | ✅ | Order type (GTC=Good Till Cancelled, FOK=Fill Or Kill) |
| `marketSlug` | string | ✅ | Market identifier slug |

### `GET_ACTIVE_MARKETS`
Browse active (unresolved) prediction markets on Limitless. Returns markets with volume, liquidity, and other trading data. Supports filtering by category and sorting.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `categoryId` | number |  | Filter by category ID (optional) |
| `page` | number |  | Page number for pagination (default: 1) |
| `limit` | number |  | Number of results per page (default: 10) |
| `sortBy` | string |  | Sort order: newest, oldest, volume, liquidity (default: newest) |

### `GET_ACTIVE_MARKETS_BY_CATEGORY`
Browse active (unresolved) markets filtered by category ID with optional pagination and sorting.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `categoryId` | number | ✅ | Category ID to filter markets by |
| `page` | number |  | Page number for pagination |
| `limit` | number |  | Number of items per page |
| `sortBy` | string |  | Sort order (e.g., newest, volume) |

### `GET_ACTIVE_SLUGS`
Get slugs, strike prices, tickers, and deadlines for all active markets and groups. Useful for discovering available markets.

_No parameters_

### `GET_AUTH_STATUS`
Check the current authentication status for the Limitless API session. Returns whether you're logged in and your Ethereum address. Session persists automatically across all tool calls.

_No parameters_

### `GET_CATEGORIES`
Get all available categories on Limitless with their IDs, names, priorities, and metadata. Use this to discover available categories for filtering markets.

_No parameters_

### `GET_CATEGORIES_COUNT`
Get the number of active markets for each category and the total market count.

_No parameters_

### `GET_FEED_EVENTS`
Get the latest feed events related to a specific market with pagination support.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | ✅ | Market slug identifier |
| `page` | number |  | Page number for pagination |
| `limit` | number |  | Number of events per page |

### `GET_HISTORICAL_PRICE`
Retrieve historical price data for a specific market with configurable time intervals. Useful for analyzing price trends.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | ✅ | Market slug identifier |
| `from` | string |  | Start date for historical data (ISO 8601 format) |
| `to` | string |  | End date for historical data (ISO 8601 format) |
| `interval` | string |  | Time interval for data points |

### `GET_LOCKED_BALANCE`
Get the amount of funds locked in open orders for the authenticated user in a specific market. Requires authentication.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | ✅ | Market slug identifier |

### `GET_MARKET`
Get detailed information about a specific prediction market on Limitless. Provides market question, outcomes, prices, volume, liquidity, and other trading data.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `addressOrSlug` | string | ✅ | Market address (0x...) or slug identifier (e.g., crypto-predictions-2025) |

### `GET_MARKET_EVENTS`
Get recent events for a specific market including trades, orders, and liquidity changes.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | ✅ | Market slug identifier |
| `page` | number |  | Page number for pagination |
| `limit` | number |  | Number of events per page |

### `GET_MARKET_ORDERBOOK`
Get the current orderbook for a prediction market on Limitless. Shows all open buy (bids) and sell (asks) orders with prices and sizes.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | ✅ | Market slug identifier (e.g., presidential-election-2024) |

### `GET_PORTFOLIO_HISTORY`
Get paginated history including AMM trades, CLOB trades, splits/merges, and NegRisk conversions. Requires authentication.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | ✅ | Page number for pagination |
| `limit` | number | ✅ | Number of items per page |
| `from` | string |  | Start date for filtering (ISO 8601 format) |
| `to` | string |  | End date for filtering (ISO 8601 format) |

### `GET_PORTFOLIO_POINTS`
Get points breakdown for the authenticated user. Requires authentication.

_No parameters_

### `GET_PORTFOLIO_POSITIONS`
Get your active portfolio positions on Limitless with P&L calculations and market values. Requires authentication via session token.

_No parameters_

### `GET_PORTFOLIO_TRADES`
Retrieve all trades executed by the authenticated user. Requires authentication.

_No parameters_

### `GET_PUBLIC_USER_POSITIONS`
Get all positions for a specific user address. This is a public endpoint that doesn't require authentication.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `account` | string | ✅ | User Ethereum address |

### `GET_SIGNING_MESSAGE`
Get a signing message with a randomly generated nonce for authentication purposes. Use this before logging in. Requires a wallet address.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address` | string | ✅ | The wallet address to get a signing message for |

### `GET_TRADING_ALLOWANCE`
Check USDC allowance for CLOB or NegRisk trading contracts. Requires authentication.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | ✅ | Trading type: CLOB or NegRisk |

### `GET_USER_ORDERS`
Get all orders placed by the authenticated user for a specific market. Requires authentication.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | ✅ | Market slug identifier |

### `GET_USER_PROFILE`
Get detailed profile information for a user by their Ethereum address. Returns comprehensive user data including username, bio, profile picture, rank, points, leaderboard position, referral information, and account status. Requires authentication. Users can view their own profile when authenticated.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address` | string | ✅ | The Ethereum address of the user whose profile to retrieve |

### `GET_USER_TRADED_VOLUME`
Get total traded volume and statistics for a specific user. This is a public endpoint that doesn't require authentication.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `account` | string | ✅ | User Ethereum address |

### `LOGIN`
Authenticate a user with a signed message and create a session. First get a signing message, sign it with your wallet, then call this with the signature.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `account` | string | ✅ | The Ethereum address of the user |
| `signingMessage` | string | ✅ | The signing message generated by the server |
| `signature` | string | ✅ | The signature generated by signing the message with the wallet |
| `userData` | object | ✅ | User data to be stored |

### `LOGOUT`
Log out the user by clearing the session cookie. Requires authentication.

_No parameters_

### `SEARCH_MARKETS`
Search for prediction markets on Limitless based on semantic similarity. Returns markets matching the search query with details like volume, liquidity, and end dates.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | ✅ | The search query for markets |
| `limit` | number |  | Maximum number of results (default: 10) |
| `page` | number |  | Page number for pagination (default: 1) |
| `similarityThreshold` | number |  | Minimum similarity score 0-1 (default: 0.5) |

### `VERIFY_AUTH`
Verify if the user is authenticated by checking the session cookie. Returns the authenticated Ethereum address.

_No parameters_

<!-- AUTO-GENERATED TOOLS END -->

## 🔐 Authentication

Many tools require authentication. This server implements **automatic session management** using HTTP cookies, just like a web browser.

### Authentication Flow

```
Step 1: Check Status
┌──────────────────────────────────────┐
│ GET_AUTH_STATUS                      │
│ → Check if already logged in         │
└──────────────────────────────────────┘
         ↓
Step 2: Get Signing Message
┌──────────────────────────────────────┐
│ GET_SIGNING_MESSAGE                  │
│ → Returns message with nonce         │
└──────────────────────────────────────┘
         ↓
Step 3: Sign with Wallet
┌──────────────────────────────────────┐
│ User signs message with MetaMask     │
│ or other Web3 wallet                 │
└──────────────────────────────────────┘
         ↓
Step 4: Login
┌──────────────────────────────────────┐
│ LOGIN                                │
│ → ✅ Session created automatically!  │
│ → Cookies stored in memory           │
└──────────────────────────────────────┘
         ↓
Step 5: Use Authenticated Tools
┌──────────────────────────────────────┐
│ GET_PORTFOLIO_POSITIONS  ✓           │
│ CREATE_ORDER             ✓           │
│ CANCEL_ORDER             ✓           │
└──────────────────────────────────────┘
```

### Tools Requiring Authentication

- 🔐 GET_LOCKED_BALANCE
- 🔐 GET_USER_ORDERS
- 🔐 GET_PORTFOLIO_POSITIONS
- 🔐 GET_PORTFOLIO_TRADES
- 🔐 GET_PORTFOLIO_HISTORY
- 🔐 GET_PORTFOLIO_POINTS
- 🔐 GET_TRADING_ALLOWANCE
- 🔐 CREATE_ORDER
- 🔐 CANCEL_ORDER
- 🔐 CANCEL_ORDER_BATCH
- 🔐 CANCEL_ALL_ORDERS

**Public tools (no authentication required):**
- All market discovery tools (SEARCH_MARKETS, GET_MARKET, etc.)
- GET_USER_TRADED_VOLUME
- GET_PUBLIC_USER_POSITIONS
- GET_SIGNING_MESSAGE
- GET_AUTH_STATUS

## 👨‍💻 Development

### 🏗️ Build Project
```bash
pnpm run build
```

### 👁️ Development Mode (Watch)
```bash
pnpm run watch
```

### 🧪 Run Tests
```bash
pnpm test:unit           # Run unit tests
pnpm test:watch          # Watch mode
pnpm test:coverage       # Generate coverage report
pnpm test:integration    # Run integration tests
```

### ✅ Linting & Formatting
```bash
pnpm run lint
pnpm run format
```

### 📁 Project Structure
*   `src/tools/`: Individual tool definitions
*   `src/services/`: API client and business logic
*   `src/lib/`: Shared utilities (HTTP client, session manager, logger)
*   `src/index.ts`: Server entry point
*   `tests/`: Unit and integration tests

## 📚 Resources

*   [Limitless Exchange](https://limitless.exchange/)
*   [Limitless API](https://api.limitless.exchange)
*   [Model Context Protocol (MCP)](https://modelcontextprotocol.io)

## ⚠️ Disclaimer

This project is an unofficial tool and is not directly affiliated with Limitless. It interacts with financial and prediction market data. Users should exercise caution and verify all data independently. Trading in prediction markets involves risk.

## 🔗 Related Projects

- [Polymarket MCP](https://github.com/IQAIcom/mcp-polymarket) - MCP server for Polymarket
- [Kalshi MCP](https://github.com/IQAIcom/mcp-kalshi) - MCP server for Kalshi
- [Opinion MCP](https://github.com/IQAIcom/mcp-opinion) - MCP server for Opinion

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](.github/CONTRIBUTING.md) for details.

## 📄 License

[ISC](LICENSE)
