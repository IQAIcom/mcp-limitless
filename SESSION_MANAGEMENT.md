# Session Management Implementation

## Overview

The Limitless MCP server now implements **automatic session management** using HTTP cookies, similar to how a web browser manages authentication. This eliminates the need to pass API keys with every request.

## How It Works

### Architecture

```
┌─────────────────┐
│   MCP Client    │
│   (Claude AI)   │
└────────┬────────┘
         │ Tool Calls
         ▼
┌─────────────────┐
│  MCP Server     │
│  ┌────────────┐ │
│  │ Session    │ │  ← CookieJar (tough-cookie)
│  │ Manager    │ │  ← Auto Cookie Handling
│  └────────────┘ │
└────────┬────────┘
         │ HTTP Requests (with cookies)
         ▼
┌─────────────────┐
│ Limitless API   │
│ api.limitless   │
│    .exchange    │
└─────────────────┘
```

### Key Components

1. **SessionManager** (`src/lib/session-manager.ts`)
   - Wraps Node.js `fetch()` with `tough-cookie` for automatic cookie handling
   - Stores and sends cookies automatically (like a browser)
   - Manages session lifecycle

2. **Enhanced Client** (`src/lib/client.ts`)
   - Uses SessionManager for all API requests
   - Provides session status methods
   - Supports backward compatibility with explicit tokens

3. **Auth Status Tool** (`src/tools/get-auth-status.ts`)
   - New tool to check authentication status
   - Shows current session state
   - Provides guidance for authentication

## Authentication Flow

### Before (Old Way - Manual Token Passing)

```typescript
// User had to pass token with EVERY authenticated call
getPortfolioPositions({ token: "xyz..." })
createOrder({ token: "xyz...", ... })
cancelOrder({ token: "xyz...", orderId: "..." })
```

Problems:
- ❌ Repetitive token passing
- ❌ User manages session manually
- ❌ Easy to forget token
- ❌ No automatic session persistence

### After (New Way - Automatic Session)

```typescript
// Step 1: Login once
GET_SIGNING_MESSAGE({ account: "0x..." })
// → Sign message with wallet
LOGIN({ account: "0x...", signature: "0x..." })

// Step 2: Session persists automatically!
GET_PORTFOLIO_POSITIONS()      // ✓ Works
CREATE_ORDER({ ... })           // ✓ Works
CANCEL_ORDER({ orderId: "..." }) // ✓ Works
GET_AUTH_STATUS()               // ✓ Shows "Authenticated as 0x..."

// Step 3: Logout when done
LOGOUT() // Clears session
```

Benefits:
- ✅ Login once, use everywhere
- ✅ Automatic session management
- ✅ Browser-like experience
- ✅ No manual token passing needed

## New Tools

### GET_AUTH_STATUS

Check authentication status at any time:

**When not authenticated:**
```
🔒 Not Authenticated

You are not currently logged in to Limitless Exchange.

To authenticate:
1. Call GET_SIGNING_MESSAGE with your Ethereum address
2. Sign the message with your wallet
3. Call LOGIN with the signature
```

**When authenticated:**
```
✅ Authenticated

Session Status: Active
Ethereum Address: 0x1234...5678

Your session is active and will persist across all tool calls.
```

## Technical Details

### Session Persistence

- **Lifetime**: Sessions persist for the lifetime of the MCP server process
- **Scope**: One session per server instance
- **Storage**: In-memory cookie jar (not persisted to disk)
- **Security**: HTTP-only cookies set by API

### Cookie Handling

```typescript
// SessionManager automatically:
1. Receives Set-Cookie headers from /auth/login
2. Stores cookies in CookieJar
3. Sends Cookie headers on subsequent requests
4. Clears cookies on /auth/logout
```


## Testing

All 92 integration tests pass with session management:
- ✅ Login creates session automatically
- ✅ Session persists across calls
- ✅ Logout clears session properly
- ✅ Auth status checks work correctly

## Dependencies

- `tough-cookie@6.0.0`: Industry-standard cookie jar implementation
- `fetch-cookie@3.1.0`: Wraps fetch() with cookie support

## Example Usage

```typescript
// In Claude or any MCP client:

User: "Check my Limitless portfolio"

Claude: [Calls GET_AUTH_STATUS]
→ "Not authenticated"

Claude: "You need to login first. What's your Ethereum address?"

User: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0"

Claude: [Calls GET_SIGNING_MESSAGE]
→ Returns signing message

Claude: "Please sign this message with your wallet..."

User: [Signs and provides signature]

Claude: [Calls LOGIN]
→ ✅ Session created automatically!

Claude: [Calls GET_PORTFOLIO_POSITIONS]
→ ✅ Returns portfolio (session cookies handled automatically!)

Claude: "You have 5 positions..."

// Later in the conversation...

User: "Place an order on market X"

Claude: [Calls CREATE_ORDER]
→ ✅ Still authenticated! (session persisted)
```

## Benefits for MCP Usage

1. **Stateful Conversations**: Authentication persists across the entire conversation
2. **Better UX**: Users don't repeat authentication for every operation
3. **API-Aligned**: Works exactly as the Limitless API intended (cookie-based)
4. **Standard Pattern**: Same as web applications use
5. **Automatic Cleanup**: Logout clears session properly

## Usage Notes

**Simple workflow**: Call LOGIN once, then use any authenticated tool. Session cookies are handled automatically.

## Future Enhancements

Potential improvements:
- [ ] Session persistence to disk (survive server restarts)
- [ ] Multiple session support (multi-user scenarios)
- [ ] Session expiry detection and auto-refresh
- [ ] MCP prompts for guided authentication flows
