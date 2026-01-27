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

### Authentication Tools (5 tools)
- **GET_AUTH_STATUS**: Check current authentication status
- **GET_SIGNING_MESSAGE**: Get a signing message with nonce for wallet authentication
- **VERIFY_AUTH**: Verify if the user is authenticated
- **LOGIN**: Authenticate a user with a signed message and create a session
- **LOGOUT**: Log out the user by clearing the session cookie

### Market Data Tools (13 tools)
- **SEARCH_MARKETS**: Search for prediction markets using semantic similarity
- **GET_MARKET**: Get detailed information about a specific market by slug or address
- **GET_ACTIVE_MARKETS**: Browse active (unresolved) markets with optional filtering
- **GET_ACTIVE_MARKETS_BY_CATEGORY**: Browse active markets filtered by category ID
- **GET_CATEGORIES**: Get all available categories
- **GET_CATEGORIES_COUNT**: Get the number of active markets for each category
- **GET_ACTIVE_SLUGS**: Get slugs, strike prices, tickers, and deadlines for all active markets
- **GET_MARKET_ORDERBOOK**: View current orderbook with bids and asks
- **GET_HISTORICAL_PRICE**: Retrieve historical price data with configurable time intervals
- **GET_FEED_EVENTS**: Get the latest feed events for a specific market
- **GET_MARKET_EVENTS**: Get recent market events including trades and orders
- **GET_LOCKED_BALANCE**: Get funds locked in open orders (requires authentication)
- **GET_USER_ORDERS**: Get all user orders for a specific market (requires authentication)

### Portfolio Tools (8 tools)
- **GET_PORTFOLIO_POSITIONS**: Get user portfolio positions with P&L calculations
- **GET_PORTFOLIO_TRADES**: Retrieve all trades executed by the user
- **GET_PORTFOLIO_HISTORY**: Get paginated history including AMM/CLOB trades, splits/merges
- **GET_PORTFOLIO_POINTS**: Get points breakdown for the user
- **GET_USER_TRADED_VOLUME**: Get total traded volume for a specific user address (public)
- **GET_PUBLIC_USER_POSITIONS**: Get all positions for a specific user address (public)
- **GET_USER_PROFILE**: Get detailed user profile information
- **GET_TRADING_ALLOWANCE**: Check USDC allowance for CLOB or NegRisk trading

### Trading Tools (4 tools)
- **CREATE_ORDER**: Create a buy or sell order for prediction market positions
- **CANCEL_ORDER**: Cancel a specific open order by order ID
- **CANCEL_ORDER_BATCH**: Cancel multiple orders in a single batch operation
- **CANCEL_ALL_ORDERS**: Cancel all user orders in a specific market

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
