# Powerhouse Stack Learnings

## Architecture Overview

### Reactive Document Architecture
- **Local-first** documents that sync globally
- **Git-like UX** — history, branching, merging, commenting
- **CQRS + EDA** — read models for aggregation
- **Stateful mini-APIs** — documents with operations as state transitions

### Core Components

1. **Connect** — Collaboration hub, private workspace
2. **Switchboard** — Data infrastructure & API engine
3. **Fusion** — SDK for data visualization
4. **Renown** — Decentralized reputation/identity
5. **Reactor** — Node for storing documents, conflict resolution

### Document Model Structure

```
document-models/
├── <name>/
│   ├── <name>.json           # Document model spec
│   ├── schema.graphql        # GraphQL schema
│   ├── module.ts             # Module export
│   ├── index.ts              # Public exports
│   ├── gen/                  # AUTO-GENERATED (never edit)
│   │   ├── schema/
│   │   ├── creators.ts
│   │   ├── reducer.ts
│   │   └── types.ts
│   ├── src/                  # Custom reducers
│   │   └── reducers/
│   └── hooks.ts              # React hooks
```

### State Type Naming

```graphql
// ✅ CORRECT
type CryptoTransactionAnalyticsState {
  transactions: [Transaction!]!
}

// ❌ WRONG — don't use "GlobalState"
type CryptoTransactionAnalyticsGlobalState {
  transactions: [Transaction!]!
}
```

### Reducer Rules

- **Pure synchronous functions** only
- **NO** `Date.now()`, `Math.random()`, `crypto.randomUUID()`
- Values must come from **action input**
- Use `Mutative` — can mutate state directly

```typescript
// ✅ GOOD
addTransactionOperation(state, action) {
  state.transactions.push({
    id: action.input.id,  // From input
    timestamp: action.input.timestamp,  // From input
    ...action.input
  });
}

// ❌ BAD
addTransactionOperation(state, action) {
  state.transactions.push({
    id: crypto.randomUUID(),  // Non-deterministic!
    timestamp: new Date(),    // Non-deterministic!
  });
}
```

### Available Scalars

| Standard | Identity | Amounts | Specialized |
|----------|----------|---------|-------------|
| `String` | `OID` | `Amount` | `EthereumAddress` |
| `Int` | `PHID` | `Amount_Tokens` | `EmailAddress` |
| `Float` | `OLabel` | `Amount_Money` | `Date` |
| `Boolean` | | `Amount_Fiat` | `DateTime` |
| | | `Amount_Crypto` | `URL` |
| | | `Amount_Currency` | `Currency` |
| | | `Amount_Percentage` | |

### Editor Patterns

```typescript
// Use generated hooks
import { useSelectedCryptoTransactionAnalyticsDocument } from "../hooks/useCryptoTransactionAnalyticsDocument.js";
import { importCsvTransactions } from "../../document-models/crypto-transaction-analytics/gen/creators.js";

export default function Editor() {
  const [document, dispatch] = useSelectedCryptoTransactionAnalyticsDocument();
  
  function handleImport(csvData: string) {
    dispatch(importCsvTransactions({
      csvData,
      timestamp: new Date().toISOString(),
      transactionIds: []
    }));
  }
}
```

### Design System Components

```typescript
// RWA (Real World Assets) components
import { 
  FormattedNumber,
  RWATableRow,
  RWATableCell,
  RWAButton
} from "@powerhousedao/design-system/rwa";

// UI components
import {
  Button,
  Input,
  Select
} from "@powerhousedao/design-system/ui";
```

### Document Operations (37 total)

**Module Management:**
- `ADD_MODULE`, `SET_MODULE_NAME`, `DELETE_MODULE`

**Operation Management:**
- `ADD_OPERATION`, `SET_OPERATION_SCHEMA`, `SET_OPERATION_REDUCER`
- `MOVE_OPERATION`, `DELETE_OPERATION`

**State Management:**
- `SET_STATE_SCHEMA`, `SET_INITIAL_STATE`

### MCP Integration

Use `reactor-mcp` for document operations:

```typescript
// Get document
mcpCall("getDocument", { id: docId })

// Dispatch actions
mcpCall("addActions", {
  documentId,
  actions: [{
    type: "ADD_TRANSACTION",
    scope: "global",
    input: { ... }
  }]
})
```

### Best Practices

1. **Never edit `gen/` folders** — auto-generated
2. **Batch actions** — minimize `addActions` calls
3. **Use `scope: "global"`** for shared state
4. **Include `OID!`** in array object types
5. **Define errors** — specific error types per operation

### Build & Test

```bash
npm run tsc      # TypeScript check
npm run lint:fix # ESLint check
npm run build    # Full build
npm run reactor  # Start MCP server
```

## Vetra Academy Resources

- Main: https://academy.vetra.io/
- Architecture: https://academy.vetra.io/academy/Architecture/PowerhouseArchitecture
- Document Models: Specification-driven design for AI collaboration

## GnosisPay Integration Patterns

### Base Currency Detection

```typescript
const result = detectBaseCurrency(transactions);
// Returns: { stablecoin: "GBPe", confidence: 0.95, reason: "..." }
```

### Transaction Import

```typescript
// CSV import
dispatch(importCsvTransactions({
  csvData: "...",
  timestamp: new Date().toISOString(),
  transactionIds: []
}));

// Calculate analytics
dispatch(calculateAnalytics({ baseCurrency: "GBP" }));
```

### Category Detection

```typescript
const category = detectCategory(toAddress, description);
// Returns: "food" | "transport" | "shopping" | ...
```
