# Cashfree Payments Agent Toolkit

The Cashfree Payments Agent Toolkit enables popular agent frameworks including LangChain, Vercel's AI SDK, and OpenAI's Agents SDK to integrate with Cashfree APIs through function calling.

## Installation

```bash
npm install @cashfreepayments/agent-toolkit
```

## Requirements

- Node 18+
- Cashfree Merchant Account (Sandbox or Production)

## Framework Support

The toolkit supports multiple frameworks, exposed through sub-paths:

- **AI SDK**: `@cashfreepayments/agent-toolkit/ai-sdk` - [Documentation](https://github.com/cashfree/agent-tools-js/blob/main/src/ai-sdk/README.md)
- **LangChain**: `@cashfreepayments/agent-toolkit/langchain` - [Documentation](https://github.com/cashfree/agent-tools-js/blob/main/src/langchain/README.md)
- **OpenAI**: `@cashfreepayments/agent-toolkit/openai` - [Documentation](https://github.com/cashfree/agent-tools-js/blob/main/src/openai/README.md)

## Usage

Each toolkit is initialized with your Cashfree credentials and environment configuration.

```typescript
import {
  CashfreeAgentToolkit,
  CFEnvironment,
} from '@cashfreepayments/agent-toolkit/openai'; // or langchain, ai-sdk

// Configuration
const environment = CFEnvironment.SANDBOX; // or PRODUCTION
const clientId = process.env.CASHFREE_CLIENT_ID;
const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

// Initialize the toolkit
const cashfree = new CashfreeAgentToolkit(environment, clientId, clientSecret);
```

Cashfree issues **separate API keys** for Payment Gateway and for the Verification Suite (SecureID). The PG keys go in the second and third arguments and are used by the order/refund/payment tools. If you plan to use the verification tools, explicitly pass your SecureID keys as the fourth argument:

```typescript
const cashfree = new CashfreeAgentToolkit(environment, clientId, clientSecret, {
  verification: {
    clientId: process.env.CASHFREE_VERIFICATION_CLIENT_ID, // SecureID keys — used by verification tools
    clientSecret: process.env.CASHFREE_VERIFICATION_CLIENT_SECRET,
  },
});
```

If the `verification` option is omitted, the PG keys are reused for verification tools — those calls will fail with authentication errors unless your account uses the same keys for both products.

## Tools

The toolkit works with OpenAI Agents SDK, LangChain and Vercel's AI SDK and can be passed as a list of tools. For example:

- Using all tools:

```typescript
import {Agent, run} from '@openai/agents';

const allTools = cashfree.getAgentTools(); // Get all tools

const agent = new Agent({
  name: 'Payment Agent',
  instructions: 'You are a helpful payment assistant.',
  model: 'gpt-4o',
  tools: allTools,
});

const result = await run(
  agent,
  'Look up customer cust_123 and create an order for Rs. 500'
);
```

- Using selective tools:

```typescript
import {Agent, run} from '@openai/agents';

const getOrderTool = cashfree.tools.getOrder;

const agent = new Agent({
  name: 'Order Details Fetching Agent',
  instructions:
    'You are a helpful assistant that fetches and returns order details',
  model: 'gpt-4o',
  tools: getOrderTool,
});

const result = await run(agent, 'Get details of order: order_12345678');
```

## Available Tools

### Payment Gateway (PG)

- createOrder: Create a new order
- getOrder: Retrieve details of an existing order
- terminateOrder: Terminate/cancel an order
- createRefund: Initiate a refund for an order
- getAllRefunds: List all refunds for an order
- getRefund: Retrieve details of a specific refund
- orderPayUsingUpi: Pay for an order using UPI
- orderPayUsingNetbanking: Pay for an order using Netbanking
- orderPayUsingApp: Pay for an order using a payment app
- orderPayUsingPlainCard: Pay for an order using a plain card
- orderPayUsingSavedCard: Pay for an order using a saved card
- createCustomer: Create a new customer in Cashfree
- fetchCustomerInstruments: Fetch saved payment instruments for a customer

### Verification Suite (SecureID)

- verifyPan: Verify a PAN and fetch the registered name
- verifyGstin: Verify a GSTIN and fetch business details
- verifyNameMatch: Fuzzy-match two names (e.g., user-provided vs registered)
- verifyBankAccount: Verify a bank account with penny drop (account number + IFSC)
- verifyIfsc: Verify an IFSC code and fetch branch details
- aadhaarGenerateOtp: Send an OTP to the Aadhaar-linked mobile number
- aadhaarVerifyOtp: Submit the OTP to complete Aadhaar verification
- createReversePennyDrop: Create a reverse penny drop bank verification request (UPI link)
- getReversePennyDropStatus: Fetch the result of a reverse penny drop request

See specific framework documentation for detailed examples.
