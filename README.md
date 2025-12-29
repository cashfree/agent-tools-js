# Cashfree Payments Agent Toolkit

The Cashfree Payments Agent Toolkit enables popular agent frameworks including LangChain, Vercel's AI SDK, and OpenAI's Agents SDK to integrate with Cashfree APIs through function calling.

## Installation

```bash
npm install @cashfree/agent-toolkit
```

## Requirements

- Node 18+
- Cashfree Merchant Account (Sandbox or Production)

## Framework Support

The toolkit supports multiple frameworks, exposed through sub-paths:

- **AI SDK**: `@cashfree/agent-toolkit/ai-sdk` - [Documentation](./src/ai-sdk/README.md)
- **LangChain**: `@cashfree/agent-toolkit/langchain` - [Documentation](./src/langchain/README.md)
- **OpenAI**: `@cashfree/agent-toolkit/openai` - [Documentation](./src/openai/README.md)

## Usage

Each toolkit is initialized with your Cashfree credentials and environment configuration.

```typescript
import {
  CashfreeAgentToolkit,
  CFEnvironment,
} from '@cashfree/agent-toolkit/openai'; // or langchain, ai-sdk

// Configuration
const environment = CFEnvironment.SANDBOX; // or PRODUCTION
const clientId = process.env.CASHFREE_CLIENT_ID;
const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

// Initialize the toolkit
const cashfree = new CashfreeAgentToolkit(environment, clientId, clientSecret);
```

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
    'You are a helpful assistant that getches and returns order details',
  model: 'gpt-4o',
  tools: getOrderTool,
});

const result = await run(agent, 'Get details of order: order_12345678');
```

See specific framework documentation for detailed examples.
