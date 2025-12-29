# Cashfree Payments Agent Toolkit - OpenAI

The Cashfree Payments Agent Toolkit enables usage with the official OpenAI Node.js SDK (both Chat Completions and Agents SDK).

## Installation

```bash
npm install @cashfree/agent-toolkit
```

## Requirements

- Node 18+
- Cashfree Merchant Account

## Usage

```typescript
import {
  CashfreeAgentToolkit,
  CFEnvironment,
} from "@cashfree/agent-toolkit/openai";

const cashfreeToolkit = new CashfreeAgentToolkit(
  CFEnvironment.SANDBOX,
  process.env.CASHFREE_CLIENT_ID!,
  process.env.CASHFREE_CLIENT_SECRET!,
);
```

## With Chat Completions API

```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [...],
  tools: cashfreeToolkit.getTools(), // Returns JSON schema
});
```

To access individual tools for execution:

```typescript
const tool = cashfreeToolkit.tools.createOrder;
// execute manually if needed
const result = await tool.execute({...});
```

## With OpenAI Agents SDK

```typescript
import { Agent } from "@openai/agents";

// Use all tools
const agent = new Agent({
  model: "gpt-4o",
  tools: cashfreeToolkit.getAgentTools(),
});
```

To use specific tools:

```typescript
const agent = new Agent({
  model: "gpt-4o",
  tools: [cashfreeToolkit.tools.createOrder, cashfreeToolkit.tools.getOrder],
});
```
