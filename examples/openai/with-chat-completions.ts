/**
 * Example: Using CashfreeAgentToolkit with OpenAI Chat Completions API
 *
 * This is the traditional approach
 */

import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources";
import {
  CashfreeAgentToolkit,
  CFEnvironment,
} from "@cashfreepayments/agent-toolkit/openai";

const openai = new OpenAI();

// Initialize the toolkit
const cashfree = new CashfreeAgentToolkit(
  CFEnvironment.SANDBOX,
  process.env.CASHFREE_CLIENT_ID!,
  process.env.CASHFREE_CLIENT_SECRET!,
);

async function main(): Promise<void> {
  let messages: ChatCompletionMessageParam[] = [
    {
      role: "user",
      content: `Create a payment order for Rs. 100 for customer john@example.com 
                with phone 9999999999 and customer id cust_123.`,
    },
  ];

  while (true) {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      tools: cashfree.getTools(), // Returns JSON schemas for all tools
    });

    const message = completion.choices[0]?.message;
    if (!message) break;

    messages.push(message);

    if (message.tool_calls) {
      const toolMessages = await Promise.all(
        message.tool_calls.map((tc) => cashfree.handleToolCall(tc)),
      );
      messages = [...messages, ...toolMessages];
    } else {
      console.log("Assistant:", message.content);
      break;
    }
  }
}

main().catch(console.error);
