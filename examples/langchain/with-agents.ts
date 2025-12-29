/**
 * Example: Using CashfreeAgentToolkit with LangChain
 *
 * This shows how to use Cashfree tools with LangChain agents.
 *
 * Usage patterns:
 * 1. Use all tools: toolkit.getTools()
 * 2. Use specific tools: [toolkit.createOrder, toolkit.getOrder]
 * 3. Use individual tools directly: toolkit.createOrder.invoke({...})
 */

import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";
import { HumanMessage } from "@langchain/core/messages";
import {
  CashfreeAgentToolkit,
  CFEnvironment,
} from "@cashfreepayments/agent-toolkit/langchain";

// Initialize the Cashfree toolkit
const cashfree = new CashfreeAgentToolkit(
  CFEnvironment.SANDBOX, // choose between SANDBOX and PRODUCTION
  process.env.CASHFREE_CLIENT_ID!,
  process.env.CASHFREE_CLIENT_SECRET!,
);

// Get the tools from the toolkit
const tools = cashfree.getTools();

// Initialize the language model
const model = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0,
});

// =====================================================
// Option 1: Basic Agent with All Cashfree Tools
// =====================================================

async function exampleBasicAgent() {
  console.log("Creating agent with Cashfree tools...");

  const agent = createAgent({
    model,
    tools: tools,
  });

  const result = await agent.invoke({
    messages: [
      new HumanMessage(
        "Create an order for Rs. 500 for customer cust_123 with phone 9999999999",
      ),
    ],
  });

  console.log(
    "Agent response:",
    result.messages[result.messages.length - 1].content,
  );
}

// =====================================================
// Option 2: Agent with Specific Tools Only
// =====================================================

async function exampleSpecificTools() {
  console.log("Creating agent with specific Cashfree tools...");

  // Use individual tools directly from the toolkit
  const specificTools = [
    cashfree.toolsMap.createOrder,
    cashfree.toolsMap.getOrder,
    cashfree.toolsMap.createRefund,
  ];

  const agent = createAgent({
    model,
    tools: specificTools,
  });

  const result = await agent.invoke({
    messages: [new HumanMessage("Get the details of order order_123")],
  });

  console.log(
    "Agent response:",
    result.messages[result.messages.length - 1].content,
  );
}

// =====================================================
// Option 3: Agent with System Message
// =====================================================

async function exampleWithSystemMessage() {
  const agent = createAgent({
    model,
    tools: tools,
  });

  const result = await agent.invoke({
    messages: [
      new HumanMessage(
        "You are a helpful payment assistant. " +
          "Create an order for Rs. 1000 for customer cust_456 with phone 8888888888.",
      ),
    ],
  });

  console.log(
    "Agent response:",
    result.messages[result.messages.length - 1].content,
  );
}

// =====================================================
// Option 4: Multi-Turn Conversation
// =====================================================

async function exampleMultiTurn() {
  const agent = createAgent({
    model,
    tools: tools,
  });

  // First turn: Create an order
  let result = await agent.invoke({
    messages: [
      new HumanMessage(
        "Create an order for Rs. 500 for customer cust_789 with phone 7777777777",
      ),
    ],
  });

  console.log(
    "First response:",
    result.messages[result.messages.length - 1].content,
  );

  // Extract order ID from the response (you might need to parse this properly)
  // For demo purposes, assuming we get an order ID
  const orderId = "order_123"; // This should be extracted from the actual response

  // Second turn: Get order details
  result = await agent.invoke({
    messages: [
      ...result.messages,
      new HumanMessage(`Now get me the details of order ${orderId}`),
    ],
  });

  console.log(
    "Second response:",
    result.messages[result.messages.length - 1].content,
  );
}

// =====================================================
// Option 5: Using Individual Tools Directly
// =====================================================

async function exampleDirectToolUse() {
  console.log("Using individual tools directly...");

  // You can use tools directly without an agent
  const result = await cashfree.toolsMap.createOrder.invoke({
    order_amount: 500,
    order_currency: "INR",
    customer_details: {
      customer_id: "cust_direct_123",
      customer_phone: "9999999999",
    },
  });

  console.log("Direct tool result:", result);
}

// =====================================================
// Run examples
// =====================================================

async function main() {
  try {
    console.log("\n=== Example 1: Basic Agent ===");
    await exampleBasicAgent();

    console.log("\n=== Example 2: Specific Tools ===");
    await exampleSpecificTools();

    console.log("\n=== Example 3: With System Message ===");
    await exampleWithSystemMessage();

    console.log("\n=== Example 4: Multi-Turn Conversation ===");
    await exampleMultiTurn();

    console.log("\n=== Example 5: Direct Tool Use ===");
    await exampleDirectToolUse();
  } catch (error) {
    console.error("Error:", error);
  }
}

// Uncomment to run
// main();
