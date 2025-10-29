# Quick Fix Guide for Failing Integration Tests

## TL;DR
**33 tests are failing because 8 services don't match the actual Limitless API responses.**
The tests are correct - the services need fixing.

---

## Fastest Fixes (Copy & Paste Ready)

### 1. Fix GetActiveMark etsService (4 tests)

**File**: `src/services/get-active-markets.ts:38-40`

Replace:
```typescript
const response = await client.request<ActiveMarketsResponse>(endpoint);
return response;
```

With:
```typescript
const response = await client.request<{data: Market[], totalMarketsCount: number}>(endpoint);
return {
  markets: response.data,
  total: response.totalMarketsCount,
  page: page,
  limit: limit
};
```

---

### 2. Fix GetCategoriesCountService (4 tests)

**File**: `src/services/get-categories-count.ts`

Replace the entire `execute` method:
```typescript
async execute(): Promise<CategoryCount[]> {
  try {
    const response = await client.request<{category: Record<string, number>, totalCount: number}>("/markets/categories/count");

    if (!response || !response.category) {
      return [];
    }

    // Transform object to array
    return Object.entries(response.category).map(([id, count]) => ({
      categoryId: id,
      count: count
    }));
  } catch (error: any) {
    throw new Error(`Failed to get categories count: ${error.message}`);
  }
}
```

---

### 3. Fix GetHistoricalPriceService (4 tests)

**File**: `src/services/get-historical-price.ts:30-36`

Replace:
```typescript
const response = await client.request<PricePoint[]>(endpoint);

if (!response) {
  throw new Error("Unable to retrieve historical prices");
}

return response;
```

With:
```typescript
const response = await client.request<{title: string, prices: PricePoint[]}>(endpoint);

if (!response || !response.prices) {
  throw new Error("Unable to retrieve historical prices");
}

return response.prices;
```

---

### 4. Fix GetMarketOrderbookService (2 tests)

**File**: `src/services/get-market-orderbook.ts:59`

Replace:
```typescript
Max Spread: ${orderbook.maxSpread.toFixed(4)}
```

With:
```typescript
Max Spread: ${typeof orderbook.maxSpread === 'string' ? Number.parseFloat(orderbook.maxSpread).toFixed(4) : orderbook.maxSpread.toFixed(4)}
```

---

### 5. Fix GetFeedEventsService (1 test)

**File**: `src/services/get-feed-events.ts:18-23`

Replace:
```typescript
interface FeedEventsResponse {
  events: FeedEvent[];
  total: number;
  page: number;
  limit: number;
}
```

With:
```typescript
interface FeedEventsResponse {
  events: FeedEvent[];
  totalPages?: number;
  page?: number;
  limit?: number;
}
```

And update format method to use `totalPages`:
```typescript
format(response: FeedEventsResponse, slug: string): string {
  // ...
  - Total Events: ${response.total || response.events.length}
  + Total Events: ${response.totalPages ? `${response.totalPages} pages` : response.events.length}
```

---

### 6. Fix User Endpoint Tests (8 tests)

**Files**:
- `tests/integration/get-user-traded-volume.integration.test.ts`
- `tests/integration/get-public-user-positions.integration.test.ts`

These tests use fake addresses that return 404. Two options:

**Option A**: Use a real address with data
```typescript
// Get a real address from recent trades
const testAddress = "0x[REAL_ADDRESS_HERE]";
```

**Option B**: Update tests to expect 404 (better for testing)
```typescript
it("should handle non-existent address", async () => {
  await expect(
    service.execute("0x0000000000000000000000000000000000000000")
  ).rejects.toThrow("not found");
});
```

---

### 7. Fix AuthSigningMessageService (4 tests)

**File**: `src/services/auth-signing-message.ts`

This is complex - API returns plain text, not JSON. Service needs major refactor:

```typescript
async execute(account: string): Promise<{ message: string; nonce: string }> {
  try {
    // Use fetch instead of client.request (which expects JSON)
    const response = await fetch(
      `https://api.limitless.exchange/auth/signing-message?account=${account}`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();

    // Parse nonce from text (format: "Nonce: xyz")
    const nonceMatch = text.match(/Nonce:\s*(.+?)(\n|$)/);
    const nonce = nonceMatch ? nonceMatch[1].trim() : '';

    return {
      message: text,
      nonce: nonce
    };
  } catch (error: any) {
    throw new Error(`Failed to get signing message: ${error.message}`);
  }
}
```

---

### 8. Fix GetMarketEventsService (2 tests)

**File**: `src/services/get-market-events.ts:10-16`

Update interface:
```typescript
interface MarketEvent {
  type: string;
  timestamp: string;
  data: {
    id?: string;  // id is nested in data
    [key: string]: any;
  };
  [key: string]: any;
}
```

And update test expectations to check `event.data.id` instead of `event.id`.

---

## Test After Each Fix

```bash
# Test specific service
pnpm test:integration -- get-active-markets

# Test all
pnpm test:integration
```

---

## Expected Results After All Fixes

```
✓ tests/integration/get-active-markets.integration.test.ts (5 tests)
✓ tests/integration/get-categories-count.integration.test.ts (4 tests)
✓ tests/integration/get-historical-price.integration.test.ts (5 tests)
✓ tests/integration/get-market-orderbook.integration.test.ts (5 tests)
✓ tests/integration/get-feed-events.integration.test.ts (4 tests)
✓ tests/integration/auth-signing-message.integration.test.ts (5 tests)
✓ tests/integration/get-market-events.integration.test.ts (5 tests)
✓ tests/integration/get-user-traded-volume.integration.test.ts (5 tests)
✓ tests/integration/get-public-user-positions.integration.test.ts (5 tests)
✓ tests/integration/get-market.integration.test.ts (5 tests)
✓ tests/integration/get-active-slugs.integration.test.ts (4 tests)
✓ tests/integration/search-markets.integration.test.ts (5 tests)
✓ tests/integration/auth-verify.integration.test.ts (3 tests)

Test Files  13 passed (13)
     Tests  60 passed (60) ✅
```

---

## Priority

Fix in this order for maximum impact:
1. get-active-markets (most used)
2. get-historical-price (critical for charts)
3. get-categories-count (navigation)
4. get-market-orderbook (trading)
5. Others (less critical)
