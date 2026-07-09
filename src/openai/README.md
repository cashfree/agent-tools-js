# Cashfree Payments Agent Toolkit - OpenAI

The Cashfree Payments Agent Toolkit enables usage with the official OpenAI Node.js SDK (both Chat Completions and Agents SDK).

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
} from "@cashfreepayments/agent-toolkit/openai";

const cashfreeToolkit = new CashfreeAgentToolkit(
  CFEnvironment.SANDBOX,
  process.env.CASHFREE_CLIENT_ID!,
  process.env.CASHFREE_CLIENT_SECRET!,
);
```

### PG vs Verification Suite (SecureID) credentials

Cashfree issues **separate API keys** for Payment Gateway and for the Verification Suite (SecureID). The PG keys go in the second and third constructor arguments; if you plan to use the verification tools (`verifyPan360`, `verifyBankAccount`, `verifyGstin`, etc.), explicitly pass your SecureID keys in the `verification` option:

```typescript
const cashfreeToolkit = new CashfreeAgentToolkit(
  CFEnvironment.SANDBOX,
  process.env.CASHFREE_CLIENT_ID!, // PG keys — used by order/refund/payment tools
  process.env.CASHFREE_CLIENT_SECRET!,
  {
    verification: {
      clientId: process.env.CASHFREE_VERIFICATION_CLIENT_ID!, // SecureID keys — used by verification tools
      clientSecret: process.env.CASHFREE_VERIFICATION_CLIENT_SECRET!,
    },
  },
);
```

If the `verification` option is omitted, the PG keys are reused for verification tools — those calls will fail with authentication errors unless your account uses the same keys for both products.

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

## Verification (SecureID) example

```typescript
import { Agent, run } from "@openai/agents";

const kycAgent = new Agent({
  name: "KYC Agent",
  instructions: "You verify customer identity and bank details.",
  model: "gpt-4o",
  tools: [
    cashfreeToolkit.tools.verifyPan360,
    cashfreeToolkit.tools.verifyBankAccount,
    cashfreeToolkit.tools.verifyIfsc,
    cashfreeToolkit.tools.verifyNameMatch,
  ],
});

const result = await run(
  kycAgent,
  "Verify PAN ABCPV1234D for JOHN DOE and bank account 026291800001191 with IFSC YESB0000262",
);
```
