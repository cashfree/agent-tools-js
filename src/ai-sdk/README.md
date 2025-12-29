# Cashfree Payments Agent Toolkit - Vercel AI SDK

The Cashfree Payments Agent Toolkit enables Vercel's AI SDK to integrate with Cashfree APIs through function calling.

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
  CashfreeAISDKToolkit,
  CFEnvironment,
} from "@cashfreepayments/agent-toolkit/ai-sdk";

const cashfreeToolkit = new CashfreeAISDKToolkit(
  CFEnvironment.SANDBOX,
  process.env.CASHFREE_CLIENT_ID!,
  process.env.CASHFREE_CLIENT_SECRET!,
);
```

## Tools

The toolkit provides individual tools that can be accessed via `cashfreeToolkit.tools`.

```typescript
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

const result = await generateText({
  model: openai("gpt-4o"),
  tools: {
    createOrder: cashfreeToolkit.tools.createOrder,
    getOrder: cashfreeToolkit.tools.getOrder,
  },
  prompt: "Create an order for Rs. 500",
});
```

To use all available tools:

```typescript
const result = await generateText({
  model: openai("gpt-4o"),
  tools: cashfreeToolkit.getTools(),
  prompt: "Create an order for Rs. 500",
});
```
