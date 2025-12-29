/**
 * Example: Using CashfreeAgentToolkit with @openai/agents SDK
 *
 * This shows how to use individual tools or all tools with the new Agents SDK.
 */

import { Agent, run } from "@openai/agents";
import {
  CashfreeAgentToolkit,
  CFEnvironment,
} from "@cashfreepayments/agent-toolkit/openai";

// Initialize the toolkit
const cashfree = new CashfreeAgentToolkit(
  CFEnvironment.SANDBOX, // choose between SANDBOX and PRODUCTION
  process.env.CASHFREE_CLIENT_ID!,
  process.env.CASHFREE_CLIENT_SECRET!,
);

// =====================================================
// Option 1: Use individual tools
// =====================================================

// Access individual tools directly from the toolkit
// Tool names are camelCase versions of the method names
const agent1 = new Agent({
  name: "Payment Bot",
  instructions: "You are a helpful payment assistant that creates orders.",
  model: "gpt-4o",
  tools: [cashfree.tools.createOrder],
});

// =====================================================
// Option 2: Use all tools at once
// =====================================================

const agent2 = new Agent({
  name: "Full Payment Bot",
  instructions: "You are a helpful payment assistant.",
  model: "gpt-4o",
  tools: cashfree.getAgentTools(), // Get all tools
});

// =====================================================
// Option 3: Mix Cashfree tools with custom tools
// =====================================================

import { tool } from "@openai/agents";
import { z } from "zod";

// your custom tool
const getCustomerInfo = tool({
  name: "get_customer_info",
  description: "Get customer information from your database",
  parameters: z.object({ customerId: z.string() }),
  async execute({ customerId }) {
    // Your custom logic here
    return {
      id: customerId,
      name: "John Doe",
      email: "john@example.com",
      phone: "9999999999",
    };
  },
});

const agent3 = new Agent({
  name: "Smart Payment Bot",
  instructions: "You can look up customers and create orders for them.",
  model: "gpt-4o",
  // use both custom and Cashfree tools
  tools: [getCustomerInfo, cashfree.tools.createOrder],
});

// =====================================================
// Running the agent
// =====================================================

async function main() {
  // Example: Run agent3 which can look up customers and create orders
  const result = await run(
    agent3,
    "Look up customer cust_123 and create an order for Rs. 500",
  );
  console.log(result);
}

main().catch(console.error);
