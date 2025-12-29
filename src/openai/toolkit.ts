import type {
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
  ChatCompletionToolMessageParam,
} from "openai/resources";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { zodToJsonSchema } from "zod-to-json-schema";
import tools, {
  type CashfreeToolDefinition,
  type CashfreeToolMethod,
} from "../tools/tools.js";
import { tool, type Tool } from "@openai/agents";

class CashfreeAgentToolkit {
  private cashfree: Cashfree;
  private toolDefinitions: CashfreeToolDefinition[];
  private _tools: ChatCompletionTool[] = [];

  /**
   * Individual tools for use with @openai/agents SDK
   * Access tools like: toolkit.createOrder etc.
   */
  [key: string]: any;

  /**
   * Object containing all tools with their names as keys
   * Access tools like: toolkit.tools.createOrder
   */
  tools: Record<CashfreeToolMethod, any> = {} as Record<
    CashfreeToolMethod,
    any
  >;

  constructor(
    environment: CFEnvironment,
    clientId: string,
    clientSecret: string,
  ) {
    this.cashfree = new Cashfree(environment, clientId, clientSecret);
    this.toolDefinitions = tools;

    // Build ChatCompletionTool array for getTools() for chat completions API
    this._tools = this.toolDefinitions.map((tool) => ({
      type: "function" as const,
      function: {
        name: tool.method,
        description: tool.description,
        parameters: zodToJsonSchema(tool.inputSchema),
      },
    }));

    // Create individual tool accessors for @openai/agents SDK
    this._createAgentTools();
  }

  /**
   * Creates individual tool properties that can be used with @openai/agents SDK
   */
  private _createAgentTools(): void {
    for (const toolDef of this.toolDefinitions) {
      const cashfree = this.cashfree;

      const agentTool = tool({
        name: toolDef.method,
        description: toolDef.description,
        parameters: toolDef.inputSchema,
        execute: async (args: any) => {
          const result = await toolDef.execute(cashfree, args);
          return typeof result === "string" ? result : JSON.stringify(result);
        },
      });

      // Attach to toolkit instance
      this[toolDef.method] = agentTool;
      // Populate tools object
      this.tools[toolDef.method as CashfreeToolMethod] = agentTool;
    }
  }

  /**
   * Get all executable tools as an array
   * Useful for agent frameworks or manual execution
   */

  /**
   * Get all tools formatted for OpenAI Chat Completions API
   * For usage with openai.chat.completions.create()
   */
  getTools(): any {
    return this._tools;
  }

  /**
   * Get all tools formatted for @openai/agents SDK
   * For usage with new Agent({ tools: [...toolkit.getAgentTools()] })
   */
  getAgentTools(): any {
    return Object.values(this.tools);
  }

  /**
   * Handle a tool call from Chat Completions API
   * For usage when processing tool_calls from the API response
   */
  async handleToolCall(
    toolCall: ChatCompletionMessageToolCall,
  ): Promise<ChatCompletionToolMessageParam> {
    if (toolCall.type !== "function") {
      return {
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify({
          error: `Unsupported tool call type: ${toolCall.type}`,
        }),
      };
    }

    const toolDef = this.toolDefinitions.find(
      (t) => t.method === toolCall.function.name,
    );

    if (!toolDef) {
      return {
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify({
          error: `Tool ${toolCall.function.name} not found`,
        }),
      };
    }

    const args = JSON.parse(toolCall.function.arguments);
    const result = await toolDef.execute(this.cashfree, args);
    return {
      role: "tool",
      tool_call_id: toolCall.id,
      content: typeof result === "string" ? result : JSON.stringify(result),
    };
  }
}

export { CFEnvironment };
export default CashfreeAgentToolkit;
