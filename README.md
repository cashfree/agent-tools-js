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
- getOrderExtendedData: Retrieve extended order data (shipment/delivery details)
- updateOrderExtendedData: Update order shipment/tracking and delivery status
- authorizeOrder: Capture or void a pre-authorized payment
- createRefund: Initiate a refund for an order
- getAllRefunds: List all refunds for an order
- getRefund: Retrieve details of a specific refund
- orderPayUsingUpi: Pay for an order using UPI
- orderPayUsingNetbanking: Pay for an order using Netbanking
- orderPayUsingApp: Pay for an order using a payment app
- orderPayUsingPlainCard: Pay for an order using a plain card
- orderPayUsingSavedCard: Pay for an order using a saved card
- getPaymentsForOrder: List all payment attempts for an order
- getPaymentById: Retrieve a specific payment by cf_payment_id
- getEligiblePaymentMethods: Get payment methods eligible for an order
- getEligibleOffers: Get offers eligible for an order
- createCustomer: Create a new customer in Cashfree
- fetchCustomerInstruments: Fetch saved payment instruments for a customer
- fetchCustomerInstrument: Fetch a specific saved instrument by instrument_id
- deleteCustomerInstrument: Delete a saved instrument

### Verification Suite (SecureID)

- verifyPan360: Verify a PAN (PAN 360) and fetch the registered name plus enriched details (PAN type, masked Aadhaar, seeding status, DOB, contact/address)
- verifyGstin: Verify a GSTIN and fetch business details
- verifyNameMatch: Fuzzy-match two names (e.g., user-provided vs registered)
- verifyBankAccount: Verify a bank account with penny drop (account number + IFSC)
- verifyIfsc: Verify an IFSC code and fetch branch details
- createReversePennyDrop: Create a reverse penny drop bank verification request (UPI link)
- getReversePennyDropStatus: Fetch the result of a reverse penny drop request
- mobile360SendOtp: Start the Mobile 360 one-click onboarding flow — send an OTP (SMS/WhatsApp) to a mobile number
- mobile360VerifyOtp: Submit the OTP to complete Mobile 360 and fetch the enriched profile linked to the number
- generateKycLink: Generate a per-user hosted KYC (form) link and optionally send it via SMS/email/WhatsApp
- getKycLinkStatus: Fetch the status and verification results of a KYC link
- generateStaticKycLink: Generate a reusable static KYC link (with QR code) for a template
- deactivateStaticKycLink: Deactivate a static KYC link for a template
- smartOcr: Extract structured data from a document image/PDF (PAN, Aadhaar, DL, Voter ID, Passport, RC, cheque, invoice) via file URL or local file
- createVkycUser: Create a user for the Video KYC flow (step 1)
- initiateVkyc: Start a Video KYC session and generate the VKYC link
- generateVkycAuthToken: Generate an OAuth token to initialise the VKYC SDK (OTP-less flow)
- getVkycStatus: Fetch the status and results of a Video KYC session

See specific framework documentation for detailed examples.
