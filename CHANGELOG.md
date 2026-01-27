# mcp-limitless

## 0.0.5

### Patch Changes

- 96d936c: Upgrade fastmcp to 3.30.1 to fix "Server does not support completions" error
- 12b9d67: Fix integration test failures:
  - Handle null values for lastTradePrice and adjustedMidpoint in orderbook API response
  - Update search-markets to use `title` field instead of `question` to match API schema
  - Fix test timeout configuration in get-feed-events integration tests

## 0.0.4

### Patch Changes

- 7830835: fix: move winston from devDependencies to dependencies

  Winston was incorrectly listed as a devDependency but is required at runtime
  for logging. This caused the package to fail when installed via npm/pnpx.

## 0.0.1

### Initial Release

- Initial release of Limitless MCP server
- Added SEARCH_MARKETS tool for semantic market search
- Added GET_MARKET tool for detailed market information
- Added GET_ACTIVE_MARKETS tool for browsing active markets
- Added GET_MARKET_ORDERBOOK tool for viewing order books
- Added GET_PORTFOLIO_POSITIONS tool for portfolio management
