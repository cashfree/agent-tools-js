/**
 * Example: Using CashfreeAISDKToolkit with Vercel AI SDK
 *
 * This shows how to use Cashfree tools with generateText and streamText.
 */

import { generateText, streamText, tool } from "ai";
import { openai } from "@ai-sdk/openai";
import {
  CashfreeAISDKToolkit,
  CFEnvironment,
} from "@cashfree/agent-toolkit/ai-sdk";
import { z } from "zod";

// Initialize the toolkit
const cashfree = new CashfreeAISDKToolkit(
  CFEnvironment.SANDBOX, // choose between SANDBOX and PRODUCTION
  process.env.CASHFREE_CLIENT_ID!,
  process.env.CASHFREE_CLIENT_SECRET!,
);

// =====================================================
// Option 1: Use individual tools with generateText
// =====================================================

async function exampleGenerateText() {
  const result = await generateText({
    model: openai("gpt-4o"),
    system: "You are a helpful payment assistant that creates orders.",
    tools: {
      createOrder: cashfree.tools.createOrder,
    },
    prompt: "Create an order for Rs. 500 for customer cust_123",
  });

  console.log("Generated text:", result.text);
  console.log("Tool calls:", result.toolCalls);
  console.log("Tool results:", result.toolResults);
}

// =====================================================
// Option 2: Use all tools at once
// =====================================================

async function exampleAllTools() {
  const result = await generateText({
    model: openai("gpt-4o"),
    system: "You are a helpful payment assistant.",
    tools: cashfree.getTools(), // Get all tools as an object
    prompt: "Get the order details for order_123",
  });

  console.log("Result:", result.text);
}

// =====================================================
// Option 3: Mix Cashfree tools with custom tools
// =====================================================

// Your custom tool
const getCustomerInfo = tool({
  description: "Get customer information from your database",
  inputSchema: z.object({ customerId: z.string() }),
  execute: async ({ customerId }) => {
    // Your custom logic here
    return {
      id: customerId,
      name: "John Doe",
      email: "john@example.com",
      phone: "9999999999",
    };
  },
});

async function exampleMixedTools() {
  const result = await generateText({
    model: openai("gpt-4o"),
    system: "You can look up customers and create orders for them.",
    tools: {
      // Custom tools
      getCustomerInfo,
      // Spread Cashfree tools
      ...cashfree.getTools(),
    },
    prompt: "Look up customer cust_123 and create an order for Rs. 500",
  });

  console.log("Result:", result.text);
  console.log("Steps:", result.steps);
}

// =====================================================
// Option 4: Use streamText for streaming responses
// =====================================================

async function exampleStreamText() {
  const result = streamText({
    model: openai("gpt-4o"),
    system: "You are a helpful payment assistant.",
    tools: {
      createOrder: cashfree.tools.createOrder,
      getOrder: cashfree.tools.getOrder,
    },
    prompt: "Create an order for Rs. 100 for customer cust_456",
  });

  console.log("Streaming response:");
  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }
  console.log("\n");
}

// =====================================================
// Option 5: Select specific Cashfree tools
// =====================================================

async function exampleSelectiveTools() {
  const result = await generateText({
    model: openai("gpt-4o"),
    system: "You help with orders and refunds.",
    tools: {
      createOrder: cashfree.tools.createOrder,
      getOrder: cashfree.tools.getOrder,
      createRefund: cashfree.tools.createRefund,
      getRefund: cashfree.tools.getRefund,
    },
    prompt: "Create a refund for order order_123 with amount Rs. 50",
  });

  console.log("Result:", result.text);
}

// =====================================================
// Running the examples
// =====================================================

async function main() {
  console.log("=== Example 1: generateText with individual tool ===");
  await exampleGenerateText();

  console.log("\n=== Example 2: generateText with all tools ===");
  await exampleAllTools();

  console.log("\n=== Example 3: Mixed custom and Cashfree tools ===");
  await exampleMixedTools();

  console.log("\n=== Example 4: streamText for streaming ===");
  await exampleStreamText();

  console.log("\n=== Example 5: Selective tools ===");
  await exampleSelectiveTools();
}

main().catch(console.error);
