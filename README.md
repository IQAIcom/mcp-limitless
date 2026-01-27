# Limitless MCP Server

[![npm version](https://img.shields.io/npm/v/@iqai/mcp-limitless.svg)](https://www.npmjs.com/package/@iqai/mcp-limitless)
[![CI](https://github.com/IQAIcom/mcp-limitless/actions/workflows/ci.yml/badge.svg)](https://github.com/IQAIcom/mcp-limitless/actions/workflows/ci.yml)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

A Model Context Protocol (MCP) server for interacting with [Limitless](https://limitless.exchange) prediction markets. This server provides tools for market discovery, portfolio management, and trading, enabling AI agents to interact with prediction markets seamlessly.

## Features

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

## Quick Start

### Using with npx (Recommended)

The easiest way to use this MCP server is with `npx`:

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

### Manual Installation (For Development)

```bash
git clone https://github.com/IQAIcom/mcp-limitless
cd mcp-limitless
pnpm install
pnpm run build
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| None | - | No environment variables required for read-only operations |

Authentication is handled via wallet signature flow (GET_SIGNING_MESSAGE → LOGIN).

### For Claude Desktop

Add to your Claude Desktop configuration:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

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

## How It Works

This MCP server acts as a bridge between AI assistants and the Limitless prediction market API:

```
┌─────────────────┐
│   MCP Client    │  ← AI Assistant (Claude, IDE extensions, etc.)
│   (Claude AI)   │
└────────┬────────┘
         │ Tool Calls (standardized MCP protocol)
         ▼
┌─────────────────┐
│  MCP Server     │  ← This project
│  ┌────────────┐ │
│  │ 30 Tools   │ │  ← Search markets, create orders, etc.
│  │ Session    │ │  ← Automatic cookie-based authentication
│  │ Manager    │ │  ← Persists login across requests
│  └────────────┘ │
└────────┬────────┘
         │ HTTP/REST API calls (with automatic cookies)
         ▼
┌─────────────────┐
│ Limitless API   │  ← Limitless Exchange backend
│ api.limitless   │
│    .exchange    │
└─────────────────┘
```

**Key Features:**
- **Automatic Session Management**: Login once, stay authenticated for the entire session
- **No API Keys Required**: Uses wallet signature authentication
- **Type-Safe**: Full TypeScript with Zod schema validation
- **Browser-Like UX**: Cookies handled automatically using `tough-cookie`

## Usage Examples

### Sample Questions for AI Agents

**Market Discovery:**
- "What prediction markets are currently active on Limitless?"
- "Search for crypto-related markets"
- "Show me the top markets by volume"
- "Get the order book for the Bitcoin $100k market"

**Portfolio Management:**
- "Show me my portfolio positions"
- "What's my P&L on open positions?"
- "List my recent trades"

**Trading:**
- "Place a buy order for 50 shares at 60 cents"
- "Cancel all my orders in this market"
- "Show me my open orders"

### Conversation Example

```
You: "Show me the top 5 crypto prediction markets on Limitless"

Claude: [Uses SEARCH_MARKETS tool]
→ Here are the top 5 crypto markets:
  1. Will Bitcoin reach $100k in 2025? (75% YES)
  2. Will Ethereum surpass $5000? (62% YES)
  ...

You: "Check if I'm logged into Limitless"

Claude: [Uses GET_AUTH_STATUS tool]
→ You're not currently authenticated. Would you like to log in?

You: "Yes, log me in. My address is 0x742d35Cc..."

Claude: [Uses GET_SIGNING_MESSAGE tool]
→ Please sign this message with your wallet:
  "Welcome to Limitless.exchange!..."

You: "Here's my signature: 0xabc123..."

Claude: [Uses LOGIN tool]
→ ✅ Successfully logged in as 0x742d35Cc...

You: "Show me my portfolio positions"

Claude: [Uses GET_PORTFOLIO_POSITIONS tool]
→ 💼 Your Portfolio:
  1. Bitcoin $100k (YES) - 100 shares @ $0.65
     Current: $0.75 | P&L: +$10.00 (+15.38%)
```

## Authentication

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

## API Documentation

This server uses the Limitless API:
- **Base URL**: `https://api.limitless.exchange`
- [Limitless Exchange](https://limitless.exchange/)

## Development

### Build
```bash
pnpm run build
```

### Development Mode
```bash
pnpm run watch
```

### Run Tests
```bash
pnpm test:unit           # Run unit tests
pnpm test:watch          # Watch mode
pnpm test:coverage       # Generate coverage report
pnpm test:integration    # Run integration tests
```

### Linting and Formatting
```bash
pnpm run lint
pnpm run format
```

## Project Structure

```
mcp-limitless/
├── src/
│   ├── lib/
│   │   ├── client.ts          # HTTP client
│   │   ├── session-manager.ts # Cookie-based session management
│   │   └── logger.ts          # Winston logger
│   ├── services/
│   │   ├── search-markets.ts
│   │   ├── get-market.ts
│   │   ├── get-portfolio-positions.ts
│   │   └── ...                # One service per tool
│   ├── tools/
│   │   ├── search-markets.ts
│   │   ├── get-market.ts
│   │   └── ...                # One tool definition per feature
│   └── index.ts               # MCP server entry point
├── tests/
│   ├── unit/                  # Unit tests
│   └── integration/           # Integration tests
├── dist/                      # Compiled output
├── package.json
└── README.md
```

## Technologies

- **TypeScript**: Type-safe development
- **fastmcp**: MCP server implementation
- **tough-cookie**: Cookie management for session persistence
- **fetch-cookie**: HTTP client with automatic cookie handling
- **Winston**: Logging
- **Zod**: Parameter validation
- **Biome**: Linting and formatting
- **Vitest**: Testing framework

## Disclaimer

This is an unofficial tool and is not affiliated with Limitless. Use at your own risk. Always verify transactions and understand the risks involved in prediction market trading.

## Related Projects

- [Polymarket MCP](https://github.com/IQAIcom/mcp-polymarket) - MCP server for Polymarket
- [Kalshi MCP](https://github.com/IQAIcom/mcp-kalshi) - MCP server for Kalshi
- [Opinion MCP](https://github.com/IQAIcom/mcp-opinion) - MCP server for Opinion

## Contributing

Contributions are welcome! Please read our [Contributing Guide](.github/CONTRIBUTING.md) for details.

## License

ISC
