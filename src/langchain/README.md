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

### PG vs Verification Suite (SecureID) credentials

Cashfree issues **separate API keys** for Payment Gateway and for the Verification Suite (SecureID). The PG keys go in the second and third constructor arguments; if you plan to use the verification tools (`verifyPan`, `verifyBankAccount`, `verifyGstin`, etc.), explicitly pass your SecureID keys in the `verification` option:

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

## Verification (SecureID) example

```typescript
import { createAgent } from "langchain";

const kycTools = [
  cashfreeToolkit.toolsMap.verifyPan,
  cashfreeToolkit.toolsMap.verifyBankAccount,
  cashfreeToolkit.toolsMap.verifyIfsc,
  cashfreeToolkit.toolsMap.verifyNameMatch,
];
const kycAgent = createAgent({ model, tools: kycTools });

const result = await kycAgent.invoke({
  messages: [
    {
      role: "user",
      content:
        "Verify PAN ABCPV1234D for JOHN DOE and bank account 026291800001191 with IFSC YESB0000262",
    },
  ],
});
```
