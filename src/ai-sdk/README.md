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

### PG vs Verification Suite (SecureID) credentials

Cashfree issues **separate API keys** for Payment Gateway and for the Verification Suite (SecureID). The PG keys go in the second and third constructor arguments; if you plan to use the verification tools (`verifyPan360`, `verifyBankAccount`, `verifyGstin`, etc.), explicitly pass your SecureID keys in the `verification` option:

```typescript
const cashfreeToolkit = new CashfreeAISDKToolkit(
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

## Verification (SecureID) example

```typescript
const result = await generateText({
  model: openai("gpt-4o"),
  tools: {
    verifyPan360: cashfreeToolkit.tools.verifyPan360,
    verifyBankAccount: cashfreeToolkit.tools.verifyBankAccount,
    verifyIfsc: cashfreeToolkit.tools.verifyIfsc,
    verifyNameMatch: cashfreeToolkit.tools.verifyNameMatch,
  },
  prompt:
    "Verify PAN ABCPV1234D for JOHN DOE and bank account 026291800001191 with IFSC YESB0000262",
});
```
