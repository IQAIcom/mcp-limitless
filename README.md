# MCP-Limitless: Model Context Protocol Server for Limitless

[![CI](https://github.com/IQAIcom/mcp-limitless/actions/workflows/ci.yml/badge.svg)](https://github.com/IQAIcom/mcp-limitless/actions/workflows/ci.yml)
[![CodeQL](https://github.com/IQAIcom/mcp-limitless/actions/workflows/codeql.yml/badge.svg)](https://github.com/IQAIcom/mcp-limitless/actions/workflows/codeql.yml)
[![npm version](https://img.shields.io/npm/v/mcp-limitless.svg)](https://www.npmjs.com/package/mcp-limitless)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

This project implements a comprehensive Model Context Protocol (MCP) server to interact with Limitless, a prediction market platform. It allows MCP-compatible clients (like AI assistants, IDE extensions, or custom applications) to access market data, manage portfolios, execute trades, and authenticate users.

## Features

**27 MCP Tools** organized into 4 categories:

### 📝 Authentication (4 tools)
- **GET_SIGNING_MESSAGE** - Get a signing message with nonce for wallet authentication
- **VERIFY_AUTH** - Verify if the user is authenticated
- **LOGIN** - Authenticate a user with a signed message and create a session
- **LOGOUT** - Log out the user by clearing the session cookie

### 📊 Market Discovery & Information (12 tools)
- **SEARCH_MARKETS** - Search for prediction markets using semantic similarity
- **GET_MARKET** - Get detailed information about a specific market by slug or address
- **GET_ACTIVE_MARKETS** - Browse active (unresolved) markets with optional filtering
- **GET_ACTIVE_MARKETS_BY_CATEGORY** - Browse active markets filtered by category ID
- **GET_CATEGORIES_COUNT** - Get the number of active markets for each category
- **GET_ACTIVE_SLUGS** - Get slugs, strike prices, tickers, and deadlines for all active markets
- **GET_MARKET_ORDERBOOK** - View current orderbook with bids and asks
- **GET_HISTORICAL_PRICE** - Retrieve historical price data with configurable time intervals
- **GET_FEED_EVENTS** - Get the latest feed events for a specific market
- **GET_MARKET_EVENTS** - Get recent market events including trades and orders
- **GET_LOCKED_BALANCE** - Get funds locked in open orders (requires authentication)
- **GET_USER_ORDERS** - Get all user orders for a specific market (requires authentication)

### 💼 Portfolio Management (7 tools)
- **GET_PORTFOLIO_POSITIONS** - Get user portfolio positions with P&L calculations (requires authentication)
- **GET_PORTFOLIO_TRADES** - Retrieve all trades executed by the user (requires authentication)
- **GET_PORTFOLIO_HISTORY** - Get paginated history including AMM/CLOB trades, splits/merges (requires authentication)
- **GET_PORTFOLIO_POINTS** - Get points breakdown for the user (requires authentication)
- **GET_USER_TRADED_VOLUME** - Get total traded volume for a specific user address (public)
- **GET_PUBLIC_USER_POSITIONS** - Get all positions for a specific user address (public)
- **GET_TRADING_ALLOWANCE** - Check USDC allowance for CLOB or NegRisk trading (requires authentication)

### 🔄 Trading & Order Management (4 tools)
- **CREATE_ORDER** - Create a buy or sell order for prediction market positions (requires authentication)
- **CANCEL_ORDER** - Cancel a specific open order by order ID (requires authentication)
- **CANCEL_ORDER_BATCH** - Cancel multiple orders in a single batch operation (requires authentication)
- **CANCEL_ALL_ORDERS** - Cancel all user orders in a specific market (requires authentication)

## Prerequisites

- Node.js (v16 or newer recommended)
- pnpm (See https://pnpm.io/installation)

## Installation

### Building from Source

1. **Clone the repository:**
   ```bash
   git clone https://github.com/IQAIcom/mcp-limitless.git
   cd mcp-limitless
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Build the server:**
   ```bash
   pnpm run build
   ```

## Running the Server with an MCP Client

MCP clients (like AI assistants, IDE extensions, etc.) will run this server as a background process. Configure your MCP client to start the server:

```json
{
  "mcpServers": {
    "limitless": {
      "command": "node",
      "args": ["/path/to/mcp-limitless/dist/index.js"]
    }
  }
}
```

Or if installed via npm:

```json
{
  "mcpServers": {
    "limitless": {
      "command": "mcp-limitless",
      "args": []
    }
  }
}
```

## Tool Examples

### Authentication Flow

#### 1. GET_SIGNING_MESSAGE
```json
{}
```

Response:
```
📝 Signing Message:

Welcome to Limitless.exchange! Please sign this message to verify your identity.

Nonce: 0xa1b2c3d4e5f67890...
```

#### 2. LOGIN
```json
{
  "account": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "signingMessage": "Welcome to Limitless.exchange!...",
  "signature": "0xabc123...",
  "userData": {
    "name": "Alice"
  }
}
```

Response:
```
✅ Login Successful!

Account: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
```

### Market Discovery

#### SEARCH_MARKETS
```json
{
  "query": "cryptocurrency markets",
  "limit": 5
}
```

#### GET_CATEGORIES_COUNT
```json
{}
```

Response:
```
📊 Active Market Counts by Category

- Crypto (ID: 1): 45 markets
- Politics (ID: 2): 32 markets
- Sports (ID: 3): 28 markets

📈 Total Active Markets: 105
```

#### GET_HISTORICAL_PRICE
```json
{
  "slug": "will-bitcoin-reach-100k-2025",
  "interval": "1d",
  "from": "2024-01-01T00:00:00Z",
  "to": "2024-12-31T23:59:59Z"
}
```

### Portfolio Management

#### GET_PORTFOLIO_POSITIONS
```json
{
  "apiKey": "your-api-key-here"
}
```

Response:
```
💼 Portfolio Positions

📍 Will Bitcoin reach $100k? - YES
- Quantity: 100
- Avg Price: 0.6500
- Current Price: 0.7500
- P&L: +$10.00 (+15.38%)

📊 Portfolio Summary:
- Total Value: $75.00
- Total P&L: +$10.00 (+15.38%)
- Active Positions: 1
```

#### GET_PORTFOLIO_TRADES
```json
{
  "apiKey": "your-api-key-here"
}
```

#### GET_USER_TRADED_VOLUME (Public)
```json
{
  "account": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
}
```

### Trading

#### CREATE_ORDER
```json
{
  "order": {
    "salt": 1234567890,
    "maker": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "signer": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "taker": "0x0000000000000000000000000000000000000000",
    "tokenId": "123456789...",
    "makerAmount": 1000000000000000000,
    "takerAmount": 750000000000000000,
    "expiration": "2025-04-30T23:59:59Z",
    "nonce": 42,
    "price": 0.75,
    "feeRateBps": 100,
    "side": "BUY",
    "signatureType": 2,
    "signature": "0xabc123..."
  },
  "ownerId": 12345,
  "orderType": "GTC",
  "marketSlug": "will-bitcoin-reach-100k-2025",
  "apiKey": "your-api-key-here"
}
```

#### CANCEL_ORDER
```json
{
  "orderId": "6f52b6d2-6c9e-4a5c-8a4f-28ab4b7ff203",
  "apiKey": "your-api-key-here"
}
```

Response:
```
✅ Order canceled successfully
```

#### CANCEL_ALL_ORDERS
```json
{
  "slug": "will-bitcoin-reach-100k-2025",
  "apiKey": "your-api-key-here"
}
```

## Development

### Run Tests
```bash
# Run all unit tests
pnpm test:unit

# Run in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Run integration tests (optional)
pnpm test:integration

# Skip integration tests
SKIP_INTEGRATION_TESTS=true pnpm test
```

See [tests/README.md](tests/README.md) for comprehensive testing documentation.

### Lint & Format
```bash
pnpm run lint
pnpm run format
```

### CI/CD

This project uses GitHub Actions for continuous integration and deployment:

- ✅ **CI Pipeline**: Automated testing, linting, and building on every push/PR
- 🔒 **Security**: CodeQL analysis for vulnerability detection
- 📦 **Publishing**: Automated npm publishing on releases
- 🤖 **Dependencies**: Automated updates via Dependabot

See [.github/CI.md](.github/CI.md) for detailed CI/CD documentation.

## Architecture

This MCP server is built with a clean, modular architecture:

- **HTTP Client** (`src/lib/client.ts`) - Handles all HTTP communication with the Limitless API
- **Services** (`src/services/`) - Each service encapsulates API interactions and response formatting
  - `execute()` method for API calls
  - `format()` method for user-friendly output
- **Tools** (`src/tools/`) - MCP tool definitions using Zod schemas for parameter validation
- **Index** (`src/index.ts`) - Server initialization and tool registration

## API Coverage

This MCP server implements **all 27 available endpoints** from the Limitless API:

### Authentication (4 endpoints)
- GET /auth/signing-message
- GET /auth/verify-auth
- POST /auth/login
- POST /auth/logout

### Markets (12 endpoints)
- GET /markets/search
- GET /markets/{addressOrSlug}
- GET /markets/active
- GET /markets/active/{categoryId}
- GET /markets/categories/count
- GET /markets/active/slugs
- GET /markets/{slug}/orderbook
- GET /markets/{slug}/historical-price
- GET /markets/{slug}/get-feed-events
- GET /markets/{slug}/events
- GET /markets/{slug}/locked-balance
- GET /markets/{slug}/user-orders

### Portfolio (7 endpoints)
- GET /portfolio/positions
- GET /portfolio/trades
- GET /portfolio/history
- GET /portfolio/points
- GET /portfolio/{account}/traded-volume
- GET /portfolio/{account}/positions
- GET /portfolio/trading/allowance

### Orders (4 endpoints)
- POST /orders
- DELETE /orders/{orderId}
- POST /orders/cancel-batch
- DELETE /orders/all/{slug}

Full API specification is available in `limitless-api.yaml`.

## Authentication

Many tools require authentication to access user-specific data or perform trading operations. There are two ways to authenticate:

### 1. Using the Authentication Flow (Recommended for Wallet Users)
```
1. Call GET_SIGNING_MESSAGE to get a message to sign
2. Sign the message with your wallet (e.g., MetaMask)
3. Call LOGIN with your account, signing message, and signature
4. Use the session for authenticated calls
```

### 2. Using an API Key
```
Pass the `apiKey` parameter to any tool that requires authentication:
{
  "apiKey": "your-bearer-token-here",
  ...other parameters
}
```

Tools that require authentication are marked with "(requires authentication)" in the features list above.

## Contributing

Contributions are welcome! Please read our [Contributing Guide](.github/CONTRIBUTING.md) for details on:

- Code of conduct
- Development workflow
- Pull request process
- Coding standards
- Testing requirements

### Quick Start for Contributors

1. Fork and clone the repository
2. Install dependencies: `pnpm install`
3. Create a feature branch: `git checkout -b feature/your-feature`
4. Make your changes and add tests
5. Run checks: `pnpm run lint && pnpm test:unit && pnpm run build`
6. Submit a pull request

See [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md) for complete guidelines.

## Related Links

- [Limitless Exchange](https://limitless.exchange/) - Official Limitless prediction market platform
- [Model Context Protocol](https://modelcontextprotocol.io/) - Learn more about MCP
- [FastMCP](https://github.com/QuantGeekDev/fast-mcp) - The MCP framework used by this server

## License

ISC
