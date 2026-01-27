---
"@iqai/mcp-limitless": patch
---

Fix integration test failures:
- Handle null values for lastTradePrice and adjustedMidpoint in orderbook API response
- Update search-markets to use `title` field instead of `question` to match API schema
- Fix test timeout configuration in get-feed-events integration tests
