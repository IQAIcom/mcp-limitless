# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) server for Limitless, a prediction market platform. The server enables AI assistants and MCP clients to interact with Limitless markets, including searching markets, getting market details, viewing orderbooks, and accessing portfolio data.

## Architecture

### Core Components

1. **HTTP Client** (`src/lib/graphql.ts`)
   - `LimitlessAPIClient` class provides HTTP communication with the Limitless API
   - Base URL: `https://api.limitless.exchange`
   - Supports standard REST operations with JSON payloads

2. **Services** (`src/services/`)
   - Each service encapsulates API interactions and response formatting
   - Services use the shared HTTP client for API requests
   - Pattern: `execute()` method for API calls, `format()` method for user-friendly output

3. **Tools** (`src/tools/`)
   - MCP tool definitions using Zod schemas for parameter validation
   - Each tool wraps a service and handles error cases
   - Tools are registered in `src/index.ts`

### Available MCP Tools (30 Total)

#### Authentication (5 tools)
- **GET_AUTH_STATUS**: Check current authentication status and get session information
- **GET_SIGNING_MESSAGE**: Get a signing message with nonce for wallet authentication
- **VERIFY_AUTH**: Verify if the user is authenticated
- **LOGIN**: Authenticate a user with a signed message and create a session
- **LOGOUT**: Log out the user by clearing the session cookie

#### Market Discovery & Information (13 tools)
- **SEARCH_MARKETS**: Search for prediction markets using semantic similarity
- **GET_MARKET**: Get detailed information about a specific market by slug or address
- **GET_ACTIVE_MARKETS**: Browse active (unresolved) markets with optional filtering
- **GET_ACTIVE_MARKETS_BY_CATEGORY**: Browse active markets filtered by category ID
- **GET_CATEGORIES**: Get all available categories with IDs, names, priorities, and metadata
- **GET_CATEGORIES_COUNT**: Get the number of active markets for each category
- **GET_ACTIVE_SLUGS**: Get slugs, strike prices, tickers, and deadlines for all active markets
- **GET_MARKET_ORDERBOOK**: View current orderbook with bids and asks
- **GET_HISTORICAL_PRICE**: Retrieve historical price data with configurable time intervals
- **GET_FEED_EVENTS**: Get the latest feed events for a specific market
- **GET_MARKET_EVENTS**: Get recent market events including trades and orders
- **GET_LOCKED_BALANCE**: Get funds locked in open orders (requires authentication)
- **GET_USER_ORDERS**: Get all user orders for a specific market (requires authentication)

#### Portfolio Management (8 tools)
- **GET_PORTFOLIO_POSITIONS**: Get user portfolio positions with P&L calculations (requires authentication)
- **GET_PORTFOLIO_TRADES**: Retrieve all trades executed by the user (requires authentication)
- **GET_PORTFOLIO_HISTORY**: Get paginated history including AMM/CLOB trades, splits/merges (requires authentication)
- **GET_PORTFOLIO_POINTS**: Get points breakdown for the user (requires authentication)
- **GET_USER_TRADED_VOLUME**: Get total traded volume for a specific user address (public)
- **GET_PUBLIC_USER_POSITIONS**: Get all positions for a specific user address (public)
- **GET_USER_PROFILE**: Get detailed profile information including username, rank, points, and leaderboard position for any user address (requires authentication)
- **GET_TRADING_ALLOWANCE**: Check USDC allowance for CLOB or NegRisk trading (requires authentication)

#### Trading & Order Management (4 tools)
- **CREATE_ORDER**: Create a buy or sell order for prediction market positions (requires authentication)
- **CANCEL_ORDER**: Cancel a specific open order by order ID (requires authentication)
- **CANCEL_ORDER_BATCH**: Cancel multiple orders in a single batch operation (requires authentication)
- **CANCEL_ALL_ORDERS**: Cancel all user orders in a specific market (requires authentication)

## Development Commands

### Building
```bash
pnpm run build
```
Compiles TypeScript to JavaScript in the `dist/` directory and makes the output executable.

### Testing
```bash
pnpm run test
```
Runs the Vitest test suite.

### Linting & Formatting
```bash
pnpm run lint      # Check code quality
pnpm run format    # Format code with Biome
```

### Running the Server
```bash
pnpm run start
```
Starts the MCP server in stdio mode for client connections.

## Adding New Tools

1. Create a service in `src/services/[tool-name].ts`:
   - Implement `execute()` for API interaction
   - Implement `format()` for response formatting

2. Create a tool in `src/tools/[tool-name].ts`:
   - Define Zod schema for parameters
   - Export tool object with name, description, parameters, and execute function

3. Register the tool in `src/index.ts`:
   - Import the tool
   - Call `server.addTool(yourTool)`

## API Reference

The full Limitless API specification is available in `limitless-api.yaml`. All implemented endpoints:

### Authentication Endpoints
- `GET /auth/signing-message` - Get signing message
- `GET /auth/verify-auth` - Verify authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Market Endpoints
- `GET /markets/search` - Semantic market search
- `GET /markets/{addressOrSlug}` - Market details
- `GET /markets/active` - Browse active markets
- `GET /markets/active/{categoryId}` - Browse active markets by category
- `GET /categories` - Get all categories with metadata
- `GET /markets/categories/count` - Get active market count per category
- `GET /markets/active/slugs` - Get active market slugs with metadata
- `GET /markets/{slug}/orderbook` - Market orderbook
- `GET /markets/{slug}/historical-price` - Get historical prices
- `GET /markets/{slug}/get-feed-events` - Get feed events for a market
- `GET /markets/{slug}/events` - Market events
- `GET /markets/{slug}/locked-balance` - Get locked balance (auth required)
- `GET /markets/{slug}/user-orders` - User orders (auth required)

### Portfolio Endpoints
- `GET /portfolio/positions` - User positions (auth required)
- `GET /portfolio/trades` - Get trades (auth required)
- `GET /portfolio/history` - Get history (auth required)
- `GET /portfolio/points` - Get points breakdown (auth required)
- `GET /portfolio/{account}/traded-volume` - User total volume (public)
- `GET /portfolio/{account}/positions` - Get all user positions (public)
- `GET /portfolio/trading/allowance` - Get user trading allowance (auth required)

### Profile Endpoints
- `GET /profiles/{address}` - Get user profile information (auth required)

### Order Endpoints
- `POST /orders` - Create order (auth required)
- `DELETE /orders/{orderId}` - Cancel order (auth required)
- `POST /orders/cancel-batch` - Cancel multiple orders (auth required)
- `DELETE /orders/all/{slug}` - Cancel all orders in market (auth required)
