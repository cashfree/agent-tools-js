# Cashfree Payments Agent Toolkit - LangChain

The Cashfree Payments Agent Toolkit enables LangChain agents to integrate with Cashfree APIs.

## Installation

```bash
npm install @cashfreepayments/agent-toolkit
```

## Requirements

- Node 18+
- Cashfree Merchant Account

## Usage

```typescript
import {
  CashfreeAgentToolkit,
  CFEnvironment,
} from "@cashfreepayments/agent-toolkit/langchain";

const cashfreeToolkit = new CashfreeAgentToolkit(
  CFEnvironment.SANDBOX,
  process.env.CASHFREE_CLIENT_ID!,
  process.env.CASHFREE_CLIENT_SECRET!,
);
```

## Tools

To load all tools into an agent:

```typescript
import { createAgent } from "langchain";

const tools = cashfreeToolkit.getTools();
const agent = createAgent({ model, tools });
```

To use specific tools:

```typescript
const tools = [
  cashfreeToolkit.toolsMap.createOrder,
  cashfreeToolkit.toolsMap.getOrder,
];
const agent = createAgent({ model, tools });
```
